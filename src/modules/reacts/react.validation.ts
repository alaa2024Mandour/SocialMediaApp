import * as z from "zod";
import { general_rules } from "../../common/validation/generalRules.validation";
import { OnModelEnum } from "../../common/enum/comment.enum";
import { ReactTypeEnum } from "../../common/enum/react.enum";

export const createReactSchema = {
    body:z.object({
        refId:general_rules.id,
        onModel:z.enum(OnModelEnum),
        reactType:z.enum(ReactTypeEnum)
    })
}



