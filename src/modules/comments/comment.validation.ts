import * as z from "zod";
import { general_rules } from "../../common/validation/generalRules.validation";
import { AllowComments_Enum, Availability_Enum } from "../../common/enum/post.enum";
import { OnModelEnum } from "../../common/enum/comment.enum";

export const createCommentSchema = {
    body:z.object({
        content:z.string().optional(),
        attachments:z.array(general_rules.file).optional(),
        tags:z.array(general_rules.id).optional(),
        onModel:z.string(),
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
    }),
    params:z.object({
        postId:general_rules.id,
        commentId:general_rules.id.optional()
    })
}



