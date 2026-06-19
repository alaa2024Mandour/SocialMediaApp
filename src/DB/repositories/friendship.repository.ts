import { Model } from "mongoose";
import { BaseRepository } from "./base.repository";
import { friendshipModel, IFriendship } from "../models/friendship.model";

class FriendshipRepository extends BaseRepository<IFriendship> {
    constructor(protected readonly model: Model<IFriendship> = (friendshipModel)) {
        super(model)
    }

}

export default FriendshipRepository;