import { NextFunction, Request, Response } from "express";
import notificationService from '../../common/service/notification.service';
import ReactRepository from "../../DB/repositories/react.repository";
import { OnModelEnum } from "../../common/enum/comment.enum";
import { AppError } from "../../common/utils/global.error.handeller";
import { createReactDTO } from './react.dto';
import redisService from '../../common/service/redis.service';
import { success_response } from '../../common/utils/successRes';
import { postAvailability } from '../../common/utils/post.utils';
import { Types } from "mongoose";
import CommentRepository from "../../DB/repositories/comment.repository";
import PostRepository from "../../DB/repositories/post.repository";

class ReactService {

    private readonly _reactModel = new ReactRepository();
    private readonly _commentModel = new CommentRepository();
    private readonly _postModel = new PostRepository();
    private readonly _notificationService = notificationService;
    private readonly _redisService = redisService;


    createReact = async (req: Request, res: Response, next: NextFunction) => {
        const { refId, onModel, reactType } = req.body as createReactDTO

        const reactExist = await this._reactModel.findOne({ filter: { createdBy: req.user?._id, refId, onModel } })
        if (reactExist) {
            if (reactType == reactExist.reactType) {
                await reactExist.deleteOne()
                return success_response({ res, message: "react deleted" })
            }
            else {
                reactExist.reactType = reactType;
                await reactExist.save()
                return success_response({ res, data: { reactType } })
            }
        }

        let comment;
        let post;

        if (onModel === OnModelEnum.Comment) {
            comment = await this._commentModel.findOne({
                filter: { _id: new Types.ObjectId(refId) },
                options: {
                    populate: {
                        path: "refId",
                        match: {
                            $or: await postAvailability(req)
                        }
                    }
                }
            });

            if (!comment?.refId) {
                throw new AppError("comment not exist or you not authorized to react");
            }
        }
        else if (onModel === OnModelEnum.Post) {
            post = await this._postModel.findOne({
                filter: {
                    _id: refId.toString(),
                    $or: await postAvailability(req)
                }
            })
            if (!post) {
                throw new AppError("post not exist or you not authorized to react")
            }
        }

        const react = await this._reactModel.create({
            createdBy: req.user?._id!,
            refId: new Types.ObjectId(refId),
            onModel,
            reactType
        })

        const userId = post?.createdBy ?? comment?.createdBy;
        if (!userId) {
            throw new AppError("notification recipient not found");
        }

        await this._notificationService.sendNotifications({
            userId,
            tokens: await this._redisService.getFCMs(userId),
            data: {
                title: "React",
                body: `${req.user!._id} reacted to your post`
            }
        })

        success_response({ res, data: react })
    }

}

export default new ReactService()