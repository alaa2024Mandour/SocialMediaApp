import z from "zod";
import { general_rules } from "../../common/validation/generalRules.validation";
import { FriendRequestStatusEnum } from "../../common/enum/friendship.enum";

export const sendFriendRequestSchema = {
    params: z.object({
        to: general_rules.id,
    })
}

export const processFriendRequestSchema = {
    params: z.object({
        requestId: general_rules.id,
    }),
    body: z.object({
        status: z.enum(FriendRequestStatusEnum),
    }),
}