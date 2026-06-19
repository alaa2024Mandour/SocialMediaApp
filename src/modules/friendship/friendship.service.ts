import { ObjectId, Types } from 'mongoose';
import { NextFunction, Request, Response } from "express";
import FriendshipRepository from "../../DB/repositories/friendship.repository";
import notificationService from "../../common/service/notification.service";
import FriendRequestRepository from "../../DB/repositories/friendRequest.repository";
import UserRepository from "../../DB/repositories/user.repository";
import { AppError } from "../../common/utils/global.error.handeller";
import redisService from '../../common/service/redis.service';
import { success_response } from '../../common/utils/successRes';
import { processFriendRequestBodyDTO, processFriendRequestParamsDTO, sendFriendRequestDTO } from './friendship.dto';
import { FriendRequestStatusEnum } from '../../common/enum/friendship.enum';
import notificationDataService from '../../common/service/notification.data.service';
import { populate } from 'dotenv';

class FriendshipService {
    constructor() { }
    private readonly _friendshipModel = new FriendshipRepository();
    private readonly _friendRequestModel = new FriendRequestRepository();
    private readonly _userModel = new UserRepository();
    private readonly _notificationService = notificationService;
    private readonly _redisService = redisService;

    sendFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
        const { to } = req.params as sendFriendRequestDTO;
        const toId = new Types.ObjectId(to);
        const userId = new Types.ObjectId(req.user?._id)

        if (toId! == userId) {
            throw new AppError("you can't send friend request to your self");

        }
        const userExist = await this._userModel.findById({ id: toId });
        if (!userExist) {
            throw new AppError("user not exist");
        }

        const requestExist = await this._friendRequestModel.findOne({
            filter: {
                $or: [
                    { to: toId, from: userId },
                    { from: toId, to: userId },
                ]
            }
        })

        if (requestExist) {
            throw new AppError("friendRequest already exist");
        }

        const areFriends = await this._friendRequestModel.findOne({
            filter: {
                $or: [
                    { userA: toId, userB: userId },
                    { userB: toId, userA: userId },
                ]
            }
        })

        if (areFriends) {
            throw new AppError("you are already friends");
        }

        const data = await this._friendRequestModel.create({ to: toId, from: userId })

        const fcmToken = await this._redisService.getFCMs(toId)
        await this._notificationService.sendNotifications({
            userId,
            tokens: fcmToken,
            data: notificationDataService.receiveFriendRequest(req.user?.firstName)
        })

        success_response({ res, status: 201, message: "friend request send successfully" })
    }

    processFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
        const { requestId } = req.params as processFriendRequestParamsDTO;
        const requestIdObject = new Types.ObjectId(requestId);
        const { status } = req.body as processFriendRequestBodyDTO;

        const request = await this._friendRequestModel.findById(
            {
                id: requestIdObject,
                options: {
                    populate: [
                        { path: "from" }
                    ]
                }
            },
        )


        if (!request) {
            throw new AppError("Request Not Exist");
        }

        console.log("=== DEBUG FRIEND REQUEST ===");
        console.log("Full Request Object:", request);
        console.log("request.to Type:", typeof request.to, "Value:", request.to?.toString());
        console.log("req.user._id Type:", typeof req.user?._id, "Value:", req.user?._id?.toString());
        console.log("============================");

        if (request.to.toString() !== req.user!._id.toString()) {
            throw new AppError("not authorized");
        }




        request.status = status;
        await request.save()

        await this._userModel.findOneAndUpdate({
            filter:{_id:request.from._id},
            updateData:{
                $push:{
                    friends : req.user?._id 
                }
            }
        })

        await this._userModel.findOneAndUpdate({
            filter:{_id:req.user?._id },
            updateData:{
                $push:{
                    friends : request.from._id 
                }
            }
        })
        let friendship;
        if (status == FriendRequestStatusEnum.accepted) {
            friendship = await this._friendshipModel.create(
                {
                    userA: req.user!._id,
                    userB: request.from._id
                },
            )

            const senderFcmTokens = await this._redisService.getFCMs(request.from._id);
            await this._notificationService.sendNotifications({
                userId: request.from as Types.ObjectId,
                tokens: senderFcmTokens,
                data: notificationDataService.acceptFriendRequest(request.from?.firstName! )
            })


            const receiverFcmTokens = await this._redisService.getFCMs(req.user?._id!);
            await this._notificationService.sendNotifications({
                userId: request.from as Types.ObjectId,
                tokens: receiverFcmTokens,
                data: notificationDataService.confirmFriendRequest(req.user?.firstName )
            })
        } 

        await request.deleteOne()

        success_response({ res, message: "you are friends now" })
    }
}


export default new FriendshipService()