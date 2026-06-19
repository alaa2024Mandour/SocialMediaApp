import { FriendRequestStatusEnum } from '../../common/enum/friendship.enum';
import mongoose, { Schema, Types } from "mongoose";
import { IUser } from './user.model';

export interface IFriendRequest {
    from: Types.ObjectId | IUser,
    to: Types.ObjectId | IUser,
    status: FriendRequestStatusEnum,
    createdAt: Date,
    updatedAt: Date
}

const friendRequestSchema = new Schema<IFriendRequest>({
    from: {
        type: Types.ObjectId,
        required: true,
        ref: "User"
    },
    to: {
        type: Types.ObjectId,
        required: true,
        ref: "User"
    },
    status: {
        type: String,
        enum: FriendRequestStatusEnum,
        default: FriendRequestStatusEnum.pending
    },
    createdAt: Date,
    updatedAt: Date
}, {
    timestamps: true,
    strict: true,
    toJSON: { virtuals: true, },
    toObject: { virtuals: true, }
})

friendRequestSchema.index({ from: 1, to: 1 }, { unique: true })
export const friendRequestModel = mongoose.models.FriendRequest || mongoose.model<IFriendRequest>("FriendRequest", friendRequestSchema);

