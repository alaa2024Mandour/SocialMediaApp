import { NextFunction, Request, Response } from "express";
import { AppError } from '../../common/utils/global.error.handeller';
import userRepository from '../../DB/repositories/user.repository';
import { success_response } from '../../common/utils/successRes';
import RedisService from '../../common/service/redis.service';
import { HydratedDocument, ObjectId, Types } from 'mongoose';
import { randomUUID } from 'node:crypto';
import { S3Service } from '../../common/service/s3.service';
import { StorageEnum } from '../../common/enum/multer.enum';
import notificationService from '../../common/service/notification.service';
import { createCommentDTO } from "./comment.dto";
import CommentRepository from "../../DB/repositories/comment.repository";
import PostRepository from "../../DB/repositories/post.repository";
import { postAvailability } from "../../common/utils/post.utils";
import { IComment } from "../../DB/models/comment.model";
import { IPost } from "../../DB/models/post.model";
import { AllowComments_Enum } from "../../common/enum/post.enum";
import { OnModelEnum } from "../../common/enum/comment.enum";

class CommentService {

    private readonly _userModel = new userRepository();
    private readonly _commentModel = new CommentRepository();
    private readonly _postModel = new PostRepository();
    private readonly _redisService = RedisService;
    private readonly _s3Service = new S3Service();
    private readonly _notificationService = notificationService;

    createComment = async (req: Request, res: Response, next: NextFunction) => {
        const { content, attachments, tags, onModel }: createCommentDTO = req.body
        const { postId, commentId } = req.params

        let doc: HydratedDocument<IComment | IPost> | null = null

        if (onModel == OnModelEnum.Post && !commentId) { //create comment on post
            doc = await this._postModel.findOne({
                filter: {
                    _id: postId,
                    $or: [...postAvailability(req)],
                    allowComments: AllowComments_Enum.allow
                }
            })
            if (!doc) throw new AppError("post not notFound");
        }
        else if (onModel == OnModelEnum.Comment && commentId) {
            doc = await this._commentModel.findOne({  //reply in comment
                filter: {
                    _id: commentId,
                    refId: postId,
                },
                options: {
                    populate: [
                        {
                            path: "refId",
                            match: {
                                $or: [...postAvailability(req)],
                                allowComments: AllowComments_Enum.allow
                            }
                        }
                    ]
                }
            })
            if (!doc?.refId) throw new AppError("comment not notFound or you not allowed to comment in this post");
        }

        if (!doc){
            throw new AppError("invalid onModel type");
        }

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
                path: `users/${req?.user?._id}/posts/${doc?.folderId}/comments/${folderId}`,
                store_type: StorageEnum.memory,
            })
        }

        const comment = await this._commentModel.create({
            attachments: urls,
            content: content!,
            createdBy: req?.user?._id!,
            tags: mentions,
            folderId,
            refId:doc?._id!,
            onModel
        })

        if (!comment) {
            await this._s3Service.deleteFiles(urls);
            throw new AppError("fail to create comment")
        }

        if (fcmTokens?.length) {
            await this._notificationService.sendNotifications({
                userId: req.user!._id,
                tokens: fcmTokens,
                data: {
                    title: `${req?.user?.firstName} mention you on a new comment `,
                    body: content || "newComment"
                }
            })
        }

        return success_response({ res, data: comment })
    }


}

export default new CommentService()