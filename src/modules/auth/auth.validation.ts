import * as z from "zod";
import { GenderEnum, RoleEnum } from "../../common/enum/user.enum";

export const signUpSchema = {
    body:z.object({
        userName: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
        address: z.string().optional(),
        age: z.number().min(18),
        gender: z.enum(Object.values(GenderEnum)).optional(),
        role: z.enum(Object.values(RoleEnum)).optional(),
        password: z.string().min(6),
        cPassword: z.string().min(6)
        }).refine((data)=>{
            return data.password == data.cPassword
        },
        {
            error:"cPassword must match password",
            path:["cPassword"]
        })
}




