import { Router } from "express";
import authMiddleware from "../../common/middleware/authentication";
import  userService from "./user.service";

const userRouter = Router()

userRouter.get("/getProfile", authMiddleware , userService.getProfile)

export default userRouter