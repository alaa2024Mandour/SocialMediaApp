import z from "zod";
import { processFriendRequestSchema, sendFriendRequestSchema } from "./friendship.validation";

export type sendFriendRequestDTO = z.infer<typeof sendFriendRequestSchema.params>;


export type processFriendRequestParamsDTO = z.infer<typeof processFriendRequestSchema.params>;

export type processFriendRequestBodyDTO = z.infer<typeof processFriendRequestSchema.body>;