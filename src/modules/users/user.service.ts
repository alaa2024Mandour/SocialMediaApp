import { NextFunction, Request, Response } from "express";
import userRepository from "../../DB/repositories/user.repository";
import { success_response } from "../../common/utils/successRes";
import { S3Service } from "../../common/service/s3.service";
import { pipeline } from "node:stream/promises";
import { AppError } from "../../common/utils/global.error.handeller";

class UserService {
    private readonly _userModel = new userRepository();
    private readonly _s3Service = new S3Service();

    getProfile = async (req:Request,res:Response,next:NextFunction) => {
        const {_id} = req.user!;
        const user = await this._userModel.findById({id:_id});
        res.status(200).json({message:"user profile",user})
    }

    uploadAttachment=async (req:Request,res:Response,next:NextFunction) => {
        const fileKey = await this._s3Service.uploadFile({file:req.file!,path:"users"});
        return success_response({res,data:fileKey})
    }

    uploadLargeAttachment=async (req:Request,res:Response,next:NextFunction) => {
        const fileKey = await this._s3Service.uploadLargeFile({file:req.file!,path:"users/large"});
        return success_response({res,data:fileKey})
    }

    uploadAttachments=async (req:Request,res:Response,next:NextFunction) => {
        const fileKeys = await this._s3Service.uploadFiles({files:req.files as Express.Multer.File[],path:"users"});
        return success_response({res,data:fileKeys})
    }

    uploadProfilePic_preSigned = async (req:Request,res:Response,next:NextFunction) => {
        const { fileName, contentType } = req.body;
        const {url,key} = await this._s3Service.createPreSignedUrl({
            fileName,
            contentType,
            path:`users/${req.user!._id}`
        });
        await this._userModel.findByIdAndUpdate({
            id:req.user!._id,
            updateData: { profilePic: key }
        })
        return success_response({res,data: {url,key}})
    }
    
    getUserProfilePicture = async (req:Request,res:Response,next:NextFunction) => {
        const {_id} = req.user!;
        const {path} = req.params as {path:string[]};
        const {download} = req.query ;
        const key = path.join("/") as string;

        const user = await this._userModel.findById({id:_id});
        if(!user?.profilePic) return res.status(404).json({message:"No profile picture found"})

        const result = await this._s3Service.getFile({key:key!});
        const stream = result.Body as NodeJS.ReadableStream;
        res.setHeader("Content-Type", result.ContentType!);
        res.setHeader("Cross-Origin-Resource-Policy","cross-origin ");
        if(download && download === "true"){
            res.setHeader("Content-Disposition", `attachment; filename="${path.pop()}"`);
        }
        await pipeline(stream, res);
        // success_response({res,data:"Profile picture retrieved successfully"})
    }

    getUserProfilePicture_preSigned = async (req:Request,res:Response,next:NextFunction) => {
        const {path} = req.params as {path:string[]};
        const key = path.join("/") as string;
        const {download} = req.query as {download:string};

        const url = await this._s3Service.getPreAssignedUrl({key,download:download?download:undefined});

        success_response({res,data:{url}})
    }

    async getFilesFromS3(folderName:string){
        const result = await this._s3Service.getFiles(folderName);
        const keys = result.Contents?.map((file)=>{
            return{key:file.Key}
        })
        return keys;
    }
    getFilesFromFolder = async (req:Request,res:Response,next:NextFunction) => {
        const folderName = req.query.folderName as string | undefined;
        if(!folderName) throw new AppError("folder name required");
        
        const keys = await this.getFilesFromS3(folderName);
        return success_response({res,data:keys});
    }

    getUserPictures=async (req:Request,res:Response,next:NextFunction) => {
        const folderName = `users/${req.user!._id}`;
        const userFiles = await this.getFilesFromS3(folderName);
        return success_response({res,data:userFiles});
    }

    deleteFile = async (req:Request,res:Response,next:NextFunction) => {
        const {path} = req.params as {path:string[]};
        const key = path.join("/") as string;
        const result = await this._s3Service.deleteFile(key);
        return success_response({res,message:"File deleted successfully",data:result});
    }

    deleteFiles = async (req:Request,res:Response,next:NextFunction) => {
        const {keys} = req.body as {keys :string[]};
        const result = await this._s3Service.deleteFiles(keys)
        return success_response({res,message:"Files deleted successfully",data:result});
    }

    deleteFolder = async (req:Request,res:Response,next:NextFunction) => {
        const {folderName} = req.query  as {folderName:string};
        if(!folderName) throw new AppError("folder name required");
        const result = await this._s3Service.deleteFolder(folderName)
        return success_response({res,message:"Folder deleted successfully",data:result});
    }
}


export default new UserService()