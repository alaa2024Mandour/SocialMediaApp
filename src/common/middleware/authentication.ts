import { NextFunction, Request, Response } from "express";
import * as configService from "../../config/config.service";
import { IUser, userModel } from "../../DB/models/user.model";
import  authService from "../utils/authentication.service";
import { BaseRepository } from "../../DB/repositories/base.repository";
import { JwtPayload } from "jsonwebtoken";

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

    const userDBService = new BaseRepository<IUser>(userModel);


    if(!authorization){
        throw new Error("token is required from the headers");
    }

    const [prefix , token] = authorization.split(" ");
    if(prefix !== configService.PREFIX){
        throw new Error("invalid token prefix");
    }
    const decoded = authService.verifyToken({token:token!,secretOrPublicKey:configService.ACCESS_SECRET_KEY!})

    if (!decoded || !decoded?.id){
        throw new Error("invalid token");
    }

    const user = await userDBService.findById({
        id:decoded.id
    })

    if (!user){
        throw new Error("invalid token");
    }

    req.user = user
    req.decoded = { ...decoded, id: decoded.id.toString() }

    next()
};

export default authMiddleware;