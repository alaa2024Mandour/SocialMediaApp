import { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { Types } from "mongoose";
import StoryRepository from "../../DB/repositories/story.repository";
import FriendshipRepository from "../../DB/repositories/friendship.repository";
import { S3Service } from "../../common/service/s3.service";
import { StorageEnum } from "../../common/enum/multer.enum";
import { AppError } from "../../common/utils/global.error.handeller";
import { success_response } from "../../common/utils/successRes";
import { createStoryDTO, storyIdDTO } from "./story.dto";

class StoryService {
    private readonly _storyModel = new StoryRepository();
    private readonly _friendshipModel = new FriendshipRepository();
    private readonly _s3Service = new S3Service();

    private getFriendIds = async (userId: Types.ObjectId) => {
        const friendships = await this._friendshipModel.find({
            filter: {
                $or: [
                    { userA: userId },
                    { userB: userId }
                ]
            }
        })

        return friendships.map((friendship) => {
            return friendship.userA.toString() === userId.toString()
                ? friendship.userB as Types.ObjectId
                : friendship.userA as Types.ObjectId
        })
    }

    createStory = async (req: Request, res: Response, next: NextFunction) => {
        const { content } = req.body as createStoryDTO;
        const files = req.files as Express.Multer.File[] | undefined;
        const folderId = randomUUID();
        let attachments: string[] = [];

        if (files?.length) {
            attachments = await this._s3Service.uploadFiles({
                files,
                path: `users/${req.user!._id}/stories/${folderId}`,
                store_type: StorageEnum.memory,
            })
        }

        const storyData: any = {
            attachments,
            folderId,
            createdBy: req.user!._id,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }

        if (content) storyData.content = content;

        const story = await this._storyModel.create(storyData)

        if (!story) {
            if (attachments.length) {
                await this._s3Service.deleteFiles(attachments);
            }
            throw new AppError("fail to create story")
        }

        return success_response({ res, status: 201, data: story })
    }

    getStories = async (req: Request, res: Response, next: NextFunction) => {
        const friendIds = await this.getFriendIds(req.user!._id);

        const stories = await this._storyModel.find({
            filter: {
                createdBy: { $in: [...friendIds, req.user!._id] },
                expiresAt: { $gt: new Date() }
            },
            options: {
                populate: [
                    { path: "createdBy", select: "firstName lastName profilePic" },
                    { path: "viewers.userId", select: "firstName lastName profilePic" },
                ],
                sort: { createdAt: -1 }
            }
        })

        return success_response({ res, data: stories })
    }

    getMyStories = async (req: Request, res: Response, next: NextFunction) => {
        const stories = await this._storyModel.find({
            filter: {
                createdBy: req.user!._id,
                expiresAt: { $gt: new Date() }
            },
            options: {
                populate: [
                    { path: "viewers.userId", select: "firstName lastName profilePic" },
                ],
                sort: { createdAt: -1 }
            }
        })

        return success_response({ res, data: stories })
    }

    viewStory = async (req: Request, res: Response, next: NextFunction) => {
        const { storyId } = req.params as storyIdDTO;
        const friendIds = await this.getFriendIds(req.user!._id);

        const story = await this._storyModel.findOneAndUpdate({
            filter: {
                _id: new Types.ObjectId(storyId),
                createdBy: { $in: [...friendIds, req.user!._id] },
                expiresAt: { $gt: new Date() },
                "viewers.userId": { $ne: req.user!._id }
            },
            updateData: {
                $push: {
                    viewers: {
                        userId: req.user!._id,
                        viewedAt: new Date()
                    }
                }
            }
        })

        if (!story) {
            throw new AppError("story not found or already viewed", 404)
        }

        return success_response({ res, message: "story viewed successfully" })
    }

    deleteStory = async (req: Request, res: Response, next: NextFunction) => {
        const { storyId } = req.params as storyIdDTO;

        const story = await this._storyModel.findOneAndDelete({
            filter: {
                _id: new Types.ObjectId(storyId),
                createdBy: req.user!._id
            }
        })

        if (!story) {
            throw new AppError("story not found or you are not authorized", 404)
        }

        if (story.attachments.length) {
            await this._s3Service.deleteFiles(story.attachments)
        }

        return success_response({ res, message: "story deleted successfully" })
    }
}

export default new StoryService();
