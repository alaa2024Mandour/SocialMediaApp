import { NextFunction, Request, Response } from "express";
import { AppError } from '../../common/utils/global.error.handeller';
import userRepository from '../../DB/repositories/user.repository';
import { success_response } from '../../common/utils/successRes';
import RedisService from '../../common/service/redis.service';
import { createPostDTO, likePostDTO, updatePostDTO } from './post.dto';
import { Types } from 'mongoose';
import { randomUUID } from 'node:crypto';
import { S3Service } from '../../common/service/s3.service';
import { StorageEnum } from '../../common/enum/multer.enum';
import PostRepository from '../../DB/repositories/post.repository';
import notificationService from '../../common/service/notification.service';
import { postAvailability } from '../../common/utils/post.utils';

class PostService {

    private readonly _userModel = new userRepository();
    private readonly _postModel = new PostRepository();
    private readonly _redisService = RedisService;
    private readonly _s3Service = new S3Service();
    private readonly _notificationService = notificationService;

    createPost = async (req: Request, res: Response, next: NextFunction) => {
        const { allowComments, content, attachments, tags, availability }: createPostDTO = req.body

        let mentions: Types.ObjectId[] = []
        let fcmTokens: string[] = []

        if (tags?.length) {
            const mentionsTags = await this._userModel.find({
                filter: {
                    _id: { $in: tags }
                }
            })

            if (tags.length != mentionsTags.length) {
                throw new AppError("invalid tag id")
            }

            if (tags.includes(String(req.user?._id!))) throw new AppError("you can't tag your self")

            for (const tag of mentionsTags) {
                mentions.push(tag._id);
                (await this._redisService.getFCMs(tag._id)).map((token) => {
                    fcmTokens.push(token)
                })
            }
        }

        let urls: string[] = []
        let folderId = randomUUID()

        if (req.files) {
            urls = await this._s3Service.uploadFiles({
                files: req.files as Express.Multer.File[],
                path: `users/${req?.user?._id}/posts/${folderId}`,
                store_type: StorageEnum.memory,
            })
        }

        const post = await this._postModel.create({
            attachments: urls,
            content: content!,
            createdBy: req?.user?._id!,
            tags: mentions,
            folderId,
            availability,
            allowComments
        })

        if (!post) {
            await this._s3Service.deleteFiles(urls);
            throw new AppError("fail to create post")
        }

        if (fcmTokens?.length) {
            await this._notificationService.sendNotifications({
                userId:req.user!._id,
                tokens: fcmTokens,
                data: {
                    title: `${req?.user?.firstName} mention you on a new Post `,
                    body: content || "newPost"
                }
            })
        }

        return success_response({ res, data: post })
    }

    getPosts = async (req: Request, res: Response, next: NextFunction) => {
        // const posts = await this._postModel.paginate(
        //     {
        //         page: +req.query.page!,
        //         limit: +req.query.limit!,
        //         search: {
                    
        //             ...(req.query.search ? {
        //                 $or: [
        //                     { content: { $regex: req.query.search, $options: "i" } },
        //                     ...postAvailability(req),
        //                 ]
        //             } : {})
        //         }
        //     }
        // )

        const posts = await this._postModel.find({
            filter:{
                $or:[
                    ...postAvailability(req),
                ]
            },
            options:{
                populate:[
                    {
                        path:"comments",
                        match:{
                            commentId:{$exists:false}
                        },
                        populate:{
                            path:"replies"
                        }
                    }
                ]
            }
        })

        return success_response({ res, data: posts })
    }


    likePost = async (req: Request, res: Response, next: NextFunction) => {
        const { postId }: likePostDTO = req.params as likePostDTO
        let post = await this._postModel.findOne({
            filter: {
                _id: postId,
                ...postAvailability(req)
            }
        })
        if (!post) throw new AppError("post not found or you not authorized...");

        let updateQuery: any;
        if (!post.likes.includes(req.user?._id!)) {
            updateQuery = {
                $addToSet: { likes: req.user?._id }
            }
        } else {
            updateQuery = {
                $pull: { likes: req.user?._id }
            }
        }
        post = await this._postModel.findOneAndUpdate({
            filter: {
                _id: postId,
            },
            updateData: updateQuery
        }
        )
        return success_response({ res, data: post })
    }


    updatePost = async (req: Request, res: Response, next: NextFunction) => {
        const { allowComments, content, attachments, removeAttachments, tags, removeTags, availability }: updatePostDTO = req.body
        const {postId} = req.params
        const post = await this._postModel.findOne({
            filter:{
                _id:postId,
                createdBy:req.user?._id
            }
        })

        if(!post) throw new AppError("you can't update this post");
        
        if(removeAttachments?.length){
            const isNotValidFiles = removeAttachments.filter((file)=>{
                return !post.attachments.includes(file)
            })

            if(isNotValidFiles.length){
                throw new AppError("invalid files, files not exist to delete it");
            }else{
                await this._s3Service.deleteFiles(removeAttachments)
            }

            post.attachments = post.attachments.filter((file)=>{
                return !removeAttachments.includes(file)
            }) as string[]
        }

        const updateTags = new Set(post.tags?.map(id=>id.toString()))
        removeTags?.forEach((tag)=>{
            return updateTags.delete(tag)
        })

        let fcmTokens: string[] = []
        if (tags?.length) {
            const mentionsTags = await this._userModel.find({
                filter: {
                    _id: { $in: tags }
                }
            })

            if (tags.length != mentionsTags.length) {
                throw new AppError("invalid tag id")
            }

            if (tags.includes(String(req.user?._id!))) throw new AppError("you can't tag your self")

            for (const tag of mentionsTags) {
                updateTags.add(tag._id.toString());
                (await this._redisService.getFCMs(tag._id)).map((token) => {
                    fcmTokens.push(token)
                })
            }
        }
        post.tags = [...updateTags].map((tag)=>{
            return new Types.ObjectId(tag)
        })

        if (req.files) {
            let urls = await this._s3Service.uploadFiles({
                files: req.files as Express.Multer.File[],
                path: `users/${req?.user?._id}/posts/${post.folderId}`,
                store_type: StorageEnum.memory,
            })
            post.attachments.push(...urls)
        }

        if (fcmTokens?.length) {
            await this._notificationService.sendNotifications({
                userId:req.user!._id,
                tokens: fcmTokens,
                data: {
                    title: `${req?.user?.firstName} mention you on a new Post `,
                    body: content || "newPost"
                }
            })
        }

        if(content) post.content = content;
        if(availability) post.availability = availability;
        if(allowComments) post.allowComments = allowComments;

        post.save()
        return success_response({res,data:post})
    }

}

export default new PostService()