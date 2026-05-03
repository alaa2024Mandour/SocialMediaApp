import { ACCESS_SECRET_KEY_ADMIN } from './../../config/config.service';
import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import * as configService from "../../config/config.service";
import { IUser } from "../../DB/models/user.model";
import  authService from "../service/authentication.service";
import { JwtPayload } from "jsonwebtoken";
import UserRepository from "../../DB/repositories/user.repository";
import redisService from "../service/redis.service";
import { AppError } from '../utils/global.error.handeller';

declare global {
    namespace Express {
        interface Request {
        user?: IUser;
        decoded?: JwtPayload & { id: string };
        }
    }
}

const authMiddleware = async (req:Request, res:Response, next:NextFunction) => {
    const {authorization} = req.headers

    const userDBService = new UserRepository();


    if(!authorization){
        throw new AppError("token is required from the headers");
    }

    const [prefix , token] = authorization.split(" ");

    let ACCESS_SECRET_KEY = "";
    if(prefix == configService.PREFIX_USER){
        ACCESS_SECRET_KEY = configService.ACCESS_SECRET_KEY_USER!;
    }
    else if (prefix == configService.PREFIX_ADMIN){
        ACCESS_SECRET_KEY = configService.ACCESS_SECRET_KEY_ADMIN!;
    }
    else{
        throw new AppError("Invalid prefix");
        
    }

    const decoded = authService.verifyToken({token:token!,secretOrPublicKey:ACCESS_SECRET_KEY})

    if (!decoded || !decoded?.id){
        throw new AppError("invalid token");
    }

    const user = await userDBService.findById({
        id:decoded.id
    })

    if (!user){
        throw new AppError("invalid token");
    }

    const revokToken = await redisService.get(redisService.revokedToken_key({userId: new Types.ObjectId(user.id), jti: parseInt(decoded.jti!, 10)}));

    if(revokToken){
            throw new AppError("invalid revoked token");
        }

    req.user = user
    req.decoded = { ...decoded, id: decoded.id.toString() }

    next()
};

export default authMiddleware;