import mongoose, { Schema, Types } from "mongoose";
import { IUser } from "./user.model";

export interface IStoryViewer {
    userId: Types.ObjectId | IUser,
    viewedAt: Date
}

export interface IStory {
    _id: Types.ObjectId,
    content?: string,
    attachments: string[],
    folderId: string,
    createdBy: Types.ObjectId | IUser,
    viewers: IStoryViewer[],
    expiresAt: Date,
    createdAt: Date,
    updatedAt: Date
}

const StoryViewerSchema = new Schema<IStoryViewer>({
    userId: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    viewedAt: {
        type: Date,
        default: Date.now
    }
}, {
    _id: false,
    timestamps: false,
    strict: true
})

const StorySchema = new Schema<IStory>({
    content: {
        type: String,
        trim: true
    },
    attachments: [String],
    folderId: String,
    createdBy: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    viewers: [StoryViewerSchema],
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true,
    strict: true,
    toJSON: { virtuals: true, },
    toObject: { virtuals: true, }
})

StorySchema.index({ createdBy: 1, expiresAt: 1 });
StorySchema.index({ expiresAt: 1 });

export const storyModel = mongoose.models.Story || mongoose.model<IStory>("Story", StorySchema);
