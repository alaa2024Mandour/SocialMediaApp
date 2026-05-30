import { Availability_Enum } from "../enum/post.enum"

export const postAvailability = (req:any) => {
    return [
                {availability : Availability_Enum.public},
                {availability : Availability_Enum.onlyMe , createdBy:req.user?._id},
                {availability : Availability_Enum.friends , createdBy:{$in:[...(req?.user?.friends || []), req.user?._id]}},
                {tags :{$in:req.user?._id}},
            ]
}