import * as z from "zod";
import { GenderEnum, RoleEnum } from "../../common/enum/user.enum";
import { general_rules } from "../../common/validation/generalRules.validation";

export const signUpSchema = {
    body:z.object({
        userName: general_rules.userName,
        email: general_rules.email,
        phone: general_rules.phone,
        address: general_rules.address,
        age: general_rules.age,
        gender: general_rules.gender,
        role: general_rules.role,
        password: general_rules.password,
        cPassword: general_rules.cPassword
        }).refine((data)=>{
            return data.password == data.cPassword
        },
        {
            error:"cPassword must match password",
            path:["cPassword"]
        })
}


export const signInSchema = {
    body:z.object({
        email: general_rules.email,
        password: general_rules.password,
        })
}





