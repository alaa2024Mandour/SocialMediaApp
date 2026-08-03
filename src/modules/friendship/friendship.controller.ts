import { Router } from "express";
import authMiddleware from "../../common/middleware/authentication";
import friendshipService from './friendship.service';
import validationMid from '../../common/middleware/validation';
import { processFriendRequestSchema, sendFriendRequestSchema, objectIdSchema } from './friendship.validation';

const friendshipRouter = Router()

// get friend requests user received >> to == userId
// get friend requests user send >> fom == userId
// friendRequest process (accept , reject)
// send friend request 
// delete friend request 


friendshipRouter.use(authMiddleware)

friendshipRouter.post("/sendFriendRequest/:to", validationMid(sendFriendRequestSchema), friendshipService.sendFriendRequest)

friendshipRouter.post("/processFriendRequest/:requestId", validationMid(processFriendRequestSchema), friendshipService.processFriendRequest)

friendshipRouter.get("/getReceivedRequests",  friendshipService.getReceivedRequests)

friendshipRouter.get("/getSentRequests",  friendshipService.getSentRequests)

friendshipRouter.delete("/removeFriend/:id", validationMid(objectIdSchema),  friendshipService.removeFriend)

friendshipRouter.delete("/cancelRequest/:id", validationMid(objectIdSchema),  friendshipService.cancelRequest)


export default friendshipRouter