import { Model } from "mongoose";
import { BaseRepository } from "./base.repository";
import { friendRequestModel, IFriendRequest } from "../models/friend.request.model";

class FriendRequestRepository extends BaseRepository<IFriendRequest> {
    constructor(protected readonly model: Model<IFriendRequest> = (friendRequestModel)) {
        super(model)
    }

}

export default FriendRequestRepository;