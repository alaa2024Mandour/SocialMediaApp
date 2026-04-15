import { NextFunction, Request, Response } from "express";
import userRepository from "../../DB/repositories/user.repository";

class UserService {
    private readonly _userModel = new userRepository();
    
        getProfile = async (req:Request,res:Response,next:NextFunction) => {
        const {_id} = req.user!;
        const user = await this._userModel.findById({id:_id});
        res.status(200).json({message:"user profile",user})
    }
}

export default new UserService()