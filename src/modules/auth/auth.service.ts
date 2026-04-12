import { NextFunction, Request, Response } from "express";
import { signUpDTO } from "./auth.dto";
import { Model } from "mongoose";
import { IUser, userModel } from "../../DB/models/user.model";

class AuthService {

    private readonly _userModel:Model<IUser> = userModel;

    signUp = async (req:Request,res:Response,next:NextFunction) => {
        const {userName,email,password,age,phone,gender} = req.body
        const user = await this._userModel.create({userName,email,password,age,phone,gender} );
        res.status(200).json({message:"user signup successful",user})
    }
}

export default new AuthService()