import * as z from "zod";
import { createStorySchema, storyIdSchema } from "./story.validation";

export type createStoryDTO = z.infer<typeof createStorySchema.body>
export type storyIdDTO = z.infer<typeof storyIdSchema.params>
