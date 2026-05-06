import { Router } from "express";
import authMiddleware from "../../common/middleware/authentication";
import  userService from "./user.service";
import multerCloud from "../../common/middleware/multer.cloud";
import { MimeEnum, StorageEnum } from "../../common/enum/multer.enum";

const userRouter = Router()

userRouter.get("/getProfile", authMiddleware , userService.getProfile)

userRouter.post(
    "/upload/attachment", 
    multerCloud({
        storage_type:StorageEnum.memory, 
        file_type:MimeEnum.images,
    })
    .single("attachment"),
    userService.uploadAttachment
)

userRouter.post(
    "/upload/large/attachment", 
    multerCloud({
        storage_type:StorageEnum.disk, 
        file_type:MimeEnum.images,
    })
    .single("attachment"),
    userService.uploadLargeAttachment
)

userRouter.post(
    "/upload/attachments", 
    multerCloud({
        storage_type:StorageEnum.disk, 
        file_type:MimeEnum.images,
    })
    .array("attachments"),
    userService.uploadAttachments
)

userRouter.post(
    "/upload/signedUrl", 
    authMiddleware,
    userService.uploadProfilePic_preSigned
)

userRouter.get(
    "/profile/picture_url/*path", 
    authMiddleware,
    userService.getUserProfilePicture_preSigned
)

userRouter.get(
    "/profile/picture/*path", 
    authMiddleware,
    userService.getUserProfilePicture
)

userRouter.get(
    "/users-files", 
    userService.getFilesFromFolder
)

userRouter.get(
    "/files-for-user", 
    authMiddleware,
    userService.getUserPictures
)

userRouter.delete(
    "/delete-file/*path", 
    userService.deleteFile
)

userRouter.delete(
    "/delete-files", 
    userService.deleteFiles
)

userRouter.delete(
    "/delete-folder", 
    userService.deleteFolder
)


export default userRouter