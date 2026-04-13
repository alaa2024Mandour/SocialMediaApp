import { Router } from "express";
import authService from "./auth.service";
import validationMid from "../../common/middleware/validation";
import { signUpSchema } from "./auth.validation";

const authRouter = Router()

authRouter.post("/signup", validationMid(signUpSchema),authService.signUp)

export default authRouter