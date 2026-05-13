
import { AllowComments_Enum, Availability_Enum } from '../../common/enum/post.enum';
import mongoose, { Schema, Types } from "mongoose";

export interface IPost {
    _id: Types.ObjectId,
    content:string,
    attachments:string[],
    likes:Types.ObjectId[],
    tags:Types.ObjectId[],
    allowComments:AllowComments_Enum,
    availability:Availability_Enum,
    createdBy:Types.ObjectId,
    folderId:string
}

const PostSchema = new Schema<IPost>({
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
    allowComments:{
        type:String,
        enum:AllowComments_Enum,
        default:AllowComments_Enum.allow
    },
    availability:{
        type:String,
        enum:Availability_Enum,
        default:Availability_Enum.public
    },
    createdBy:{
        type:Types.ObjectId,
        ref:"User",
        required:true
    },
    folderId:String
}
)



// PostSchema.pre("findOne",function(){
//     console.log("--------findOne---------");
//     console.log(this.getQuery());
//     const {paranoid , ...rest} = this.getQuery()

//     if(paranoid==false){
//         this.setQuery({...rest})
//     }
//     else{
//         this.setQuery({deleteAt:{$exists:false},...rest})
//     }
// })

export const postModel = mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

