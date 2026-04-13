import { Router } from "express";
import authService from "./auth.service";
import validationMid from "../../common/middleware/validation";
import { signInSchema, signUpSchema } from "./auth.validation";

const authRouter = Router()

authRouter.post("/signUp", validationMid(signUpSchema),authService.signUp)
authRouter.post("/signIn", validationMid(signInSchema),authService.signIn)

export default authRouter