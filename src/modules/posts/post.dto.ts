import { createPostSchema, likePostSchema, updatePostSchema} from "./post.validation";
import * as z from "zod";

export type  createPostDTO = z.infer<typeof createPostSchema.body>
export type  likePostDTO = z.infer<typeof likePostSchema.params>
export type  updatePostDTO = z.infer<typeof updatePostSchema.body>