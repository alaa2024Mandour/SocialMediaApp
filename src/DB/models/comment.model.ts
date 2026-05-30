
import mongoose, { Schema, Types } from "mongoose";
import { OnModelEnum } from "../../common/enum/comment.enum";

export interface IComment {
    _id: Types.ObjectId,
    content:string,
    attachments:string[],
    likes:Types.ObjectId[],
    tags:Types.ObjectId[],
    createdBy:Types.ObjectId,
    folderId:string,
    refId:Types.ObjectId,
    onModel:string
}

const CommentSchema = new Schema<IComment>({
    content:{
        type:String,
        min:1,
        required:function(this){
            return !this.attachments.length
        }
    },
    attachments:[String],
    likes:[{type:Types.ObjectId,ref:"User"}],
    tags:[{type:Types.ObjectId,ref:"User"}],
    createdBy:{
        type:Types.ObjectId,
        ref:"User",
        required:true
    },
    refId:{
        type:Types.ObjectId,
        refPath:"onModel",
        required:true
    },
    onModel:{
        type:String,
        enum:OnModelEnum,
        required:true
    },
    folderId:String
},
{
    timestamps: true,
    strict: true,
    toJSON: {virtuals: true,} ,
    toObject: {virtuals: true,}
}
)


CommentSchema.virtual(
    "replies",
    {
        ref:"Comment",
        localField:"_id",
        foreignField:"refId"
    }
)
export const commentModel = mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

