import { Router } from "express";
import chatService from "./chat.service";
import authMiddleware from "../../common/middleware/authentication";

const chatRouter = Router({mergeParams:true})

chatRouter.get("/",authMiddleware,chatService.getChat)

export default chatRouter