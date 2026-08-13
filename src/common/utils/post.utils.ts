import { Availability_Enum } from "../enum/post.enum"
import { Types } from "mongoose";
import FriendshipRepository from "../../DB/repositories/friendship.repository";

// export const postAvailability = (req:any) => {
//     return [
//                 {availability : Availability_Enum.public},
//                 {availability : Availability_Enum.onlyMe , createdBy:req.user?._id},
//                 {availability : Availability_Enum.friends , createdBy:{$in:[...(req?.user?.friends || []), req.user?._id]}},
//                 {tags :{$in:req.user?._id}},
//             ]
// }


const friendshipModel = new FriendshipRepository();

export const postAvailability = async (req: any) => {
    const userId = req.user?._id;

    const friendships = await friendshipModel.find({
        filter: {
            $or: [
                { userA: userId },
                { userB: userId }
            ]
        }
    });

    const friendIds = friendships.map((friendship) => {
        return friendship.userA.toString() === userId.toString()
            ? friendship.userB
            : friendship.userA;
    });

    return [
        { availability: Availability_Enum.public },
        { availability: Availability_Enum.onlyMe, createdBy: userId },
        {
            availability: Availability_Enum.friends,
            createdBy: { $in: [...friendIds, userId] }
        },
        { tags: { $in: userId } },
    ];
};