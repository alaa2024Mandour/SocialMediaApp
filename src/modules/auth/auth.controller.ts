import { Router } from "express";
import authService from "./auth.service";
import validationMid from "../../common/middleware/validation";
import { 
    confirmEmail_schema, resendEmail_schema, signInSchema, signUpSchema } from "./auth.validation";

const authRouter = Router()

authRouter.post("/signUp", validationMid(signUpSchema),authService.signUp)
authRouter.post("/signIn", validationMid(signInSchema),authService.signIn)
authRouter.post("/confirm_email", validationMid(confirmEmail_schema),authService.confirmEmail)
authRouter.post("/resend_email", validationMid(resendEmail_schema),authService.resendEmail)
authRouter.post("/signInWithGoogle", authService.signUpWithGmail)

export default authRouter