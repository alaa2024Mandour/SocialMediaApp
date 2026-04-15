import authenticationService from '../../common/utils/authentication.service';
import { BaseRepository } from './../../DB/repositories/base.repository';
import { NextFunction, Request, Response } from "express";
import { IUser, userModel } from "../../DB/models/user.model";
import { AppError } from '../../common/utils/global.error.handeller';
import * as configService from "../../config/config.service";
import { v4 as uuidv4 } from 'uuid';
import userRepository from '../../DB/repositories/user.repository';
import { Hash } from '../../common/utils/security/hash.security';
import { encrypt } from '../../common/utils/security/encrypt.security';
import { generateOTP, sendEmail } from '../../common/utils/email/send.email';
import { emailTemplate } from '../../common/utils/email/email.template';

class AuthService {

    private readonly _userModel = new userRepository();

    signUp = async (req:Request,res:Response,next:NextFunction) => {
        const {userName,email,password,age,phone,gender} = req.body
        if(await this._userModel.checkUser(email)){
            throw new AppError("email already exist",400)
        }
        const user = await this._userModel.create({
            userName,
            email,
            password:Hash({plainText:password}),
            age,
            phone:encrypt(phone),
            gender
        });

        const otp = await generateOTP();
        await sendEmail({
            to:email,
            subject:"welcome to social media app , verify your account",
            html:emailTemplate(otp)
        })
        res.status(200).json({message:"user signup successful",user})
    }

    signIn = async (req:Request,res:Response,next:NextFunction) => {
        const {email,password} = req.body
        const user = await this._userModel.findOne({filter:{email,password}});
        if(!user){
            throw new AppError("invalid email or password",400)
        }

        const randomID = uuidv4();

        const accessToken = authenticationService.generateToken({
            payload:{id:user.id},
            secretOrPrivateKey:configService.ACCESS_SECRET_KEY!,
            options:{
                expiresIn:"1m",
                jwtid:randomID
            }
        })

        const refreshToken = authenticationService.generateToken({
            payload:{id:user.id},
            secretOrPrivateKey:configService.REFRESH_SECRET_KEY!,
            options:{
                expiresIn:"30d",
                jwtid:randomID
            }
        })
        res.status(200).json({message:"user signin successful",data:{accessToken,refreshToken}})
    }



}

export default new AuthService()