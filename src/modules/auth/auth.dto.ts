// export type signUpDTO = {
//     userName:string,
//     email:string,
//     password:string
// }

import { confirmEmail_schema, signInSchema, signUpSchema } from "./auth.validation";
import * as z from "zod";

export type  signUpDTO = z.infer<typeof signUpSchema.body>
export type  signInDTO = z.infer<typeof signInSchema.body>
export type  confirmEmailDTO = z.infer<typeof confirmEmail_schema.body>