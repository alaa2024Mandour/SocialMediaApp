import { Router } from "express";
import chatService from "./chat.service";
import authMiddleware from "../../common/middleware/authentication";
import multerCloud from "../../common/middleware/multer.cloud";
import { MimeEnum, StorageEnum } from "../../common/enum/multer.enum";

const chatRouter = Router({mergeParams:true})

chatRouter.get("/",authMiddleware,chatService.getChat)

chatRouter.get("/group/:groupId",authMiddleware,chatService.getGroupChat)

chatRouter.post(
    "/group",
    authMiddleware,
    multerCloud({
        storage_type:StorageEnum.memory,
        file_type: MimeEnum.images,
    }).single("attachment"),
    chatService.createGroup)

export default chatRouter