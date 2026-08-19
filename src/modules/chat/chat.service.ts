import { likePostSchema } from './../posts/post.validation';
import { ObjectId, Types } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { Request, response, Response } from "express";
import ChatRepository from "../../DB/repositories/chat.repository";
import UserRepository from "../../DB/repositories/user.repository";
import { AppError } from "../../common/utils/global.error.handeller";
import { success_response } from "../../common/utils/successRes";
import RedisService from '../../common/service/redis.service';
import { randomUUID } from "node:crypto";
import { S3Service } from '../../common/service/s3.service';
import FriendshipRepository from '../../DB/repositories/friendship.repository';

class ChatService {
    constructor() { }
    private readonly _chatModel = new ChatRepository();
    private readonly _friendShipModel = new FriendshipRepository();
    private readonly _redisService = RedisService;
    private readonly _s3Service = new S3Service();

    //rest APIs
    getChat = async (req: Request, res: Response) => {
        const { userId } = req.params
        let { page, limit } = req.query as unknown as { page: number, limit: number };
        if (page < 0 || !page) {
            page = 1
        }
        page = page * 1 || 1
        limit = limit * 1 || 5

        const chat = await this._chatModel.findOne({
            filter: {
                participants: {
                    $all: [req.user?._id, userId],
                },
                groupName: { $exists: false }
            },
            projection: {
                messages: {
                    $slice: [-(page * limit), limit]
                }
            },
            options: {
                populate: [
                    { path: "participants" }
                ]
            }
        })

        if (!chat) {
            throw new AppError("chat not found", 400)
        }

        success_response({ res, message: "Done", data: { chat } })
    }

    getGroupChat = async (req: Request, res: Response) => {
        const { groupId } = req.params
        let { page, limit } = req.query as unknown as { page: number, limit: number };
        if (page < 0 || !page) {
            page = 1
        }
        page = page * 1 || 1
        limit = limit * 1 || 5

        const chat = await this._chatModel.findOne({
            filter: {
                _id: groupId,
                participants: {
                    $in: [req.user?._id],
                },
                groupName: { $exists: true }
            },
            projection: {
                messages: {
                    $slice: [-(page * limit), limit]
                }
            },
            options: {
                populate: [
                    { path: "messages.createdBy" }
                ]
            }
        })

        if (!chat) {
            throw new AppError("chat not found", 400)
        }

        success_response({ res, message: "Done", data: { chat } })
    }

    createGroup = async (req: Request, res: Response) => {
        let { groupName, groupImage, participants } = req.body;
        const createdBy = req.user?._id!;
        const participantsObjectId = participants.map((participant: string) => new Types.ObjectId(participant));

        const users = await this._friendShipModel.find({
            filter: {
                $or: [
                    { userA: { $in: participantsObjectId }, userB: createdBy },
                    { userB: { $in: participantsObjectId }, userA: createdBy },
                ]
            },
        })


        if (users.length !== participants.length) {
            throw new Error("some users not found");
        }

        const roomId = randomUUID() 
        if (req.file) {
            groupImage = await this._s3Service.uploadFile({
                path: `chat/${roomId}`,
                file: req.file as Express.Multer.File
            })
        }

        participants.push(createdBy)
        const groupChat = await this._chatModel.create({
            groupName,
            groupImage,
            participants,
            roomId,
            messages: [],
            createdBy
        })

        if (!groupChat) {
            if (groupImage) {
                await this._s3Service.deleteFile(groupImage)
            }
            throw new AppError("failed to create the group");
        }

        return success_response({ res, message: "group created successfully" })
    }

    joinRoom = async (data: any, socket: Socket, io: Server) => {
        const { roomId } = data;

        const chat = await this._chatModel.findOne({
            filter: {
                roomId,
                participants: { $in: [socket.data.user._id] },
                groupName: { $exists: true }
            }
        })

        if (!chat) {
            throw new AppError("chat not found", 404);
        }

        socket.join(chat.roomId)
    }

    sendMessage = async (data: any, socket: Socket, io: Server) => {
        const { sendTo, content } = data;
        const createdBy = socket.data.user._id

        const userExist = await this._friendShipModel.findOne({
            filter: {
                $or: [
                    { userA: sendTo, userB: createdBy },
                    { userA: createdBy, userB: sendTo },
                ]
            }
        });
        if (!userExist) {
            throw new AppError("user not exist");
        }

        const chat = await this._chatModel.findOneAndUpdate({
            filter: {
                participants: { $all: [sendTo, createdBy] },
                groupName: { $exists: false }
            },
            updateData: {
                $push: {
                    messages: {
                        content,
                        createdBy
                    }
                }
            }
        })

        if (!chat) {
            await this._chatModel.create({
                createdBy,
                participants: [sendTo, createdBy],
                messages: [
                    {
                        content,
                        createdBy
                    }
                ]
            })
        }

        io.to(await this._redisService.getSocketIos(createdBy)).emit("successMessage", { content });
        io.to(await this._redisService.getSocketIos(sendTo)).emit("newMessage", { content, from: socket.data.user });
    }

    sendGroupMessage = async (data: any, socket: Socket, io: Server) => {
        const { groupId, content } = data;
        const createdBy = socket.data.user._id


        const chat = await this._chatModel.findOneAndUpdate({
            filter: {
                _id: groupId,
                participants: { $all: [createdBy] },
                groupName: { $exists: true }
            },
            updateData: {
                $push: {
                    messages: {
                        content,
                        createdBy
                    }
                }
            }
        })

        if (!chat) {
            throw new AppError("chat not found", 404);
        }

        io.to(await this._redisService.getSocketIos(createdBy)).emit("successMessage", { content });
        io.to(chat.roomId).emit("newMessage", { content, from: socket.data.user, groupId: chat._id });
    }


}

export default new ChatService()