import mongoose, { Types } from "mongoose";

interface IMessage {
    createdBy: Types.ObjectId,
    content: string
}

export interface IChat {
    //OVO
    createdBy: Types.ObjectId,
    participants: Types.ObjectId[],
    messages: IMessage[],

    //OVM
    roomId: string,
    groupName: string,
    groupImage: string,
}

const MessageSchema = new mongoose.Schema<IMessage>({
    createdBy: {
        type: Types.ObjectId,
        required: true,
        ref: "User"
    },
    content: {
        type: String,
        required: true
    },
},
    {
        timestamps: true,
        strict: true,
        toJSON: { virtuals: true, },
        toObject: { virtuals: true, }
    }
)

const ChatSchema = new mongoose.Schema<IChat>({
    createdBy: {
        type: Types.ObjectId,
        required: true,
        ref: "User"
    },
    messages: [MessageSchema],
    participants: [
        {
            type: Types.ObjectId,
            required: true,
            ref: "User"
        }
    ],
    roomId: String,
    groupImage: String,
    groupName: String,
},
    {
    timestamps: true,
    strict: true,
    toJSON: {virtuals: true,} ,
    toObject: {virtuals: true,}
}
)

export const chatModel = mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);
