import { PrivateKey } from 'jsonwebtoken';
import { Router } from "express";
import authMiddleware from "../../common/middleware/authentication";
import friendshipService from './friendship.service';
import validationMid from '../../common/middleware/validation';
import { processFriendRequestSchema, sendFriendRequestSchema } from './friendship.validation';

const friendshipRouter = Router()

// get friend requests user received >> to == userId
// get friend requests user send >> fom == userId
// friendRequest process (accept , reject)
// send friend request 
// delete friend request 


friendshipRouter.use(authMiddleware)

friendshipRouter.post("/sendFriendRequest/:to", validationMid(sendFriendRequestSchema), friendshipService.sendFriendRequest)

friendshipRouter.post("/processFriendRequest/:requestId", validationMid(processFriendRequestSchema), friendshipService.processFriendRequest)


export default friendshipRouter