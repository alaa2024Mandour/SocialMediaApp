import { Model } from "mongoose";
import { IUser, userModel } from "../models/user.model";
import { BaseRepository } from "./base.repository";

class UserRepository extends BaseRepository<IUser> {
    constructor(protected readonly model : Model<IUser>  = (userModel)){
        super(model)
    }

    async checkUser (email:string){
        const userExist = await this.model.findOne({email});
        return userExist;
    }
}

export default UserRepository;