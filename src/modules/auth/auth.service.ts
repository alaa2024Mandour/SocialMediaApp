import { NextFunction, Request, Response } from "express";
import { signUpDTO } from "./auth.dto";

class AuthService {

    signUp(req:Request,res:Response,next:NextFunction){
        const {userName,email,password} : signUpDTO = req.body
        res.status(200).json({message:"signup route",user:{userName,email,password}})
    }

}

export default new AuthService()