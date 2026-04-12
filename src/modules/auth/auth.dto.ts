// export type signUpDTO = {
//     userName:string,
//     email:string,
//     password:string
// }

import { signUpSchema } from "./auth.validation";
import * as z from "zod";

export type  signUpDTO = z.infer<typeof signUpSchema.body>