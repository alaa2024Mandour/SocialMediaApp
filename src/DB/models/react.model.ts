
import mongoose, { Schema, Types } from "mongoose";
import { OnModelEnum } from "../../common/enum/comment.enum";
import { ReactTypeEnum } from "../../common/enum/react.enum";

export interface IReact {
    _id: Types.ObjectId,
    createdBy: Types.ObjectId,
    reactType: ReactTypeEnum,
    refId: Types.ObjectId,
    onModel: string
}

const ReactSchema = new Schema<IReact>({
    createdBy: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    reactType: {
        type: String,
        enum: ReactTypeEnum,
        required: true
    },
    refId: {
        type: Types.ObjectId,
        refPath: "onModel",
        required: true
    },
    onModel: {
        type: String,
        enum: OnModelEnum,
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

ReactSchema.index(
    { createdBy: 1, refId: 1, onModel: 1 },
    { unique: true }
);

export const reactModel = mongoose.models.React || mongoose.model<IReact>("React", ReactSchema);

