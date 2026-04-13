import { NextFunction, Request, Response } from "express";
import { IUser, userModel } from "../../DB/models/user.model";
import { BaseRepository } from "../../DB/repositories/base.repository";

class UserService {
    private readonly _userModel = new BaseRepository<IUser>(userModel);
        getProfile = async (req:Request,res:Response,next:NextFunction) => {
        const {_id} = req.user!;
        const user = await this._userModel.findById({id:_id});
        res.status(200).json({message:"user profile",user})
    }
}

export default new UserService()