import * as z from "zod";
import { general_rules } from "../../common/validation/generalRules.validation";
import { AllowComments_Enum, Availability_Enum } from "../../common/enum/post.enum";

export const createPostSchema = {
    body:z.object({
        content:z.string().optional(),
        attachments:z.array(general_rules.file).optional(),
        allowComments:z.enum(AllowComments_Enum).default(AllowComments_Enum.allow),
        availability:z.enum(Availability_Enum).default(Availability_Enum.public),
        tags:z.array(general_rules.id).optional()
    }).superRefine((args,ctx)=>{
        if(!args.content && !args.attachments?.length){
            ctx.addIssue({
                code:"custom",
                path:["content"],
                message:"content or attachments is required"
            })
        }

        if(args.tags?.length){
            const uniqueTags = new Set(args.tags)
            if (args.tags.length !== uniqueTags.size){
                ctx.addIssue({
                    code:"custom",
                    path:["tags"],
                    message:"Duplicate tag"
                })
            }
        }
    })
}
export const likePostSchema = {
    params:z.object({
        postId:general_rules.id
    })
}


export const updatePostSchema = {
    body:z.object({
        content:z.string().optional(),
        attachments:z.array(general_rules.file).optional(),
        removeAttachments:z.array(z.string()).optional() ,
        allowComments:z.enum(AllowComments_Enum).default(AllowComments_Enum.allow),
        availability:z.enum(Availability_Enum).default(Availability_Enum.public),
        tags:z.array(general_rules.id).optional(),
        removeTags:z.array(general_rules.id).optional()
    }).superRefine((args,ctx)=>{
        if(args.tags?.length){
            const uniqueTags = new Set(args.tags)
            if (args.tags.length !== uniqueTags.size){
                ctx.addIssue({
                    code:"custom",
                    path:["tags"],
                    message:"Duplicate tag"
                })
            }
        }
    }),
    params:z.object({
        postId:general_rules.id
    })
}


