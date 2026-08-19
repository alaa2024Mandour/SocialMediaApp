import * as z from "zod";
import { general_rules } from "../../common/validation/generalRules.validation";

export const createStorySchema = {
    body: z.object({
        content: z.string().trim().optional(),
        attachments: z.array(z.any()).optional(),
    }).superRefine((args, ctx) => {
        if (!args.content && !args.attachments?.length) {
            ctx.addIssue({
                code: "custom",
                path: ["content"],
                message: "content or attachments is required"
            })
        }
    })
}

export const storyIdSchema = {
    params: z.object({
        storyId: general_rules.id
    })
}
