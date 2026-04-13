import * as z from "zod"; 
import { GenderEnum, RoleEnum } from "../enum/user.enum";
import { Types } from "mongoose";

export const general_rules = {
    userName: z.string().min(2).max(50),

    firstName: z.string().min(2).max(50),

    lastName: z.string().min(2).max(50),

    email: z.email(),

    password: z
        .string()
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
            {message:"Invalid passwords , must contain numbers , lower and upper letters and spetial characters "}
        ),


    cPassword: z.string(),

    phone: z
        .string()
        .regex(
            /^(01|02001|\+201)[0125][0-9]{8}$/,
            {message: "Invalid phone number"}
        ).optional(),

    age:z.number(),
    address:z.string().optional(),
    gender: z.enum(Object.values(GenderEnum)).default(GenderEnum.MALE),

    role: z.enum(Object.values(RoleEnum)).default(RoleEnum.USER),

    id: z.string().refine((value) => Types.ObjectId.isValid(value), { //custom validation
        message: "Invalid MongoDB ObjectId structure", 
    }),

    otp: z
        .string()
        .regex(
            /^\d{6}$/,
            {message: "OTP should be 6 digits"}
        ),

    file: z
        .object({
            fieldname: z.string(),
            originalname: z.string(),
            encoding: z.string(),
            mimetype: z.string(),
            destination: z.string(),
            filename: z.string(),
            path: z.string(),
            size: z.number(),
        })
};
