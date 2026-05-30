import { NextFunction, Request, Response, Router } from "express";
import postService from "./post.service";
import validationMid from "../../common/middleware/validation";
import { createPostSchema, likePostSchema, updatePostSchema } from "./post.validation";
import multerCloud from "../../common/middleware/multer.cloud";
import { MimeEnum, StorageEnum } from "../../common/enum/multer.enum";
import authMiddleware from "../../common/middleware/authentication";
import commentRouter from "../comments/comment.controller";

const postRouter = Router()

postRouter.use("/:postId/comments{/:commentId/reply}",commentRouter)

postRouter.post(
    "/createPost", 
    multerCloud({storage_type:StorageEnum.memory,file_type:[...MimeEnum.images,...MimeEnum.videos]}).array("attachments"),
    (req: Request, res: Response, next: NextFunction) => {
        console.log("------------postMid---------");
        
        console.log(req?.files);
        next();
    },
    validationMid(createPostSchema),
    authMiddleware,
    postService.createPost)

postRouter.get(
    "/getPosts", 
    authMiddleware,
    postService.getPosts)

postRouter.patch(
    "/likePosts/:postId", 
    validationMid(likePostSchema),
    authMiddleware,
    postService.likePost)

    postRouter.put(
    "/updatePost/:postId", 
    multerCloud({storage_type:StorageEnum.memory,file_type:[...MimeEnum.images,...MimeEnum.videos]}).array("attachments"),
    (req: Request, res: Response, next: NextFunction) => {
        console.log("------------postMid---------");
        
        console.log(req?.files);
        next();
    },
    validationMid(updatePostSchema),
    authMiddleware,
    postService.updatePost)

export default postRouter