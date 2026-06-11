import { Request, Response } from "express";
import ChatRepository from "../../DB/repositories/chat.repository";
import UserRepository from "../../DB/repositories/user.repository";
import { AppError } from "../../common/utils/global.error.handeller";
import { success_response } from "../../common/utils/successRes";

class ChatService {
    constructor() { }
    private readonly _chatModel = new ChatRepository();
    private readonly _userModel = new UserRepository();

    //rest APIs
    getChat=async (req:Request,res:Response)=>{
        const {userId} = req.params

        const chat = await this._chatModel.findOne({
            filter:{
                participants:{
                    $all:[req.user?._id,userId],
                },
                groupName:{$exists:false}
            },
            options:{
                populate:[
                    {path:"participants"}
                ]
        }
        })

        if(!chat){
            throw new AppError("chat not found",400)
        }

        success_response({res,message:"Done",data:chat})
    }



    // socketIo APIs
    sayHi = (data:any) => {
        console.log({data});
    }

    sendMessage=(data:any)=>{
        
    }

}

export default new ChatService()