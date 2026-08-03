import z from "zod";
import { processFriendRequestSchema, objectIdSchema, sendFriendRequestSchema } from "./friendship.validation";

export type sendFriendRequestDTO = z.infer<typeof sendFriendRequestSchema.params>;


export type processFriendRequestParamsDTO = z.infer<typeof processFriendRequestSchema.params>;

export type objectIdParamsDTO = z.infer<typeof objectIdSchema.params>;

export type processFriendRequestBodyDTO = z.infer<typeof processFriendRequestSchema.body>;