import * as z from "zod";

export const signUpSchema = {
    body:z.object({
        userName: z.string(),
        email: z.string().email(),
        password: z.string().min(6)
        })
}
