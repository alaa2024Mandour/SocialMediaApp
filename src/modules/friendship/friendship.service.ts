import { Types } from 'mongoose';
import { NextFunction, Request, Response } from "express";
import FriendshipRepository from "../../DB/repositories/friendship.repository";
import notificationService from "../../common/service/notification.service";
import FriendRequestRepository from "../../DB/repositories/friendRequest.repository";
import UserRepository from "../../DB/repositories/user.repository";
import { AppError } from "../../common/utils/global.error.handeller";
import redisService from '../../common/service/redis.service';
import { success_response } from '../../common/utils/successRes';
import { objectIdParamsDTO, processFriendRequestBodyDTO, processFriendRequestParamsDTO, sendFriendRequestDTO } from './friendship.dto';
import { FriendRequestStatusEnum } from '../../common/enum/friendship.enum';
import notificationDataService from '../../common/service/notification.data.service';

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
        const userId = req.user?._id


        if (toId.toString() == userId!.toString()) {
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

        const areFriends = await this._friendshipModel.findOne({
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

        await this._friendRequestModel.create({ to: toId!, from: userId! })

        const fcmToken = await this._redisService.getFCMs(toId)
        await this._notificationService.sendNotifications({
            userId: userId!,
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

        if (request.to.toString() !== req.user!._id.toString()) {
            throw new AppError("not authorized");
        }

        request.status = status;
        await request.save()


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
                data: notificationDataService.acceptFriendRequest((request.from as any).firstName!)
            })


            const receiverFcmTokens = await this._redisService.getFCMs(req.user?._id!);
            await this._notificationService.sendNotifications({
                userId: request.from as Types.ObjectId,
                tokens: receiverFcmTokens,
                data: notificationDataService.confirmFriendRequest(req.user?.firstName)
            })
        }

        await request.deleteOne()

        success_response({ res, message: friendship ? "you are friends now" : "friend request deleted successfully" })
    }

    getReceivedRequests = async (req: Request, res: Response, next: NextFunction) => {
        const friendRequests = await this._friendRequestModel.find({
            filter: {
                to: req.user?._id,
                status: FriendRequestStatusEnum.pending
            }
        })

        success_response({ res, data: friendRequests })
    }

    getSentRequests = async (req: Request, res: Response, next: NextFunction) => {
        const friendRequests = await this._friendRequestModel.find({
            filter: {
                from: req.user?._id,
                status: FriendRequestStatusEnum.pending
            }
        })

        success_response({ res, data: friendRequests })
    }

    removeFriend = async (req: Request, res: Response, next: NextFunction) => {
        const targetId = req.params.id as unknown as objectIdParamsDTO

        if (targetId.toString() == req.user!._id.toString()) {
            throw new AppError("you can't remove your self");
        }
        const friendShip = await this._friendshipModel.findOneAndDelete({
            filter: {
                $or: [
                    { userA: new Types.ObjectId(targetId.toString()), userB: req.user!._id },
                    { userB: new Types.ObjectId(targetId.toString()), userA: req.user!._id },
                ]
            }
        });

        if (!friendShip) {
            throw new AppError("you are not friends");
        }

        return success_response({ res, message: "deleted successfully" });
    }

    cancelRequest = async (req: Request, res: Response, next: NextFunction) => {
        const requestId = req.params.id as unknown as objectIdParamsDTO

        const requestCanceled = await this._friendRequestModel.findOne({
            filter: {
                _id: new Types.ObjectId(requestId.toString()),
                from: req.user!._id
            }
        })

        if (!requestCanceled) {
            throw new AppError("request not exist")
        }

        await requestCanceled.deleteOne()
        success_response({ res, message: "your request canceled" })
    }
}


export default new FriendshipService()