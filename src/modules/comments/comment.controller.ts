import { NextFunction, Request, Response, Router } from "express";
import commentService from "./comment.service";
import validationMid from "../../common/middleware/validation";
import { createCommentSchema} from "./comment.validation";
import multerCloud from "../../common/middleware/multer.cloud";
import { MimeEnum, StorageEnum } from "../../common/enum/multer.enum";
import authMiddleware from "../../common/middleware/authentication";

const commentRouter = Router({mergeParams:true})

commentRouter.post(
    "/", 
    multerCloud({storage_type:StorageEnum.memory,file_type:[...MimeEnum.images,...MimeEnum.videos]}).array("attachments"),
    validationMid(createCommentSchema),
    authMiddleware,
    commentService.createComment)



export default commentRouter