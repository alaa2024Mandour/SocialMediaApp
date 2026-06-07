// export type signUpDTO = {
//     userName:string,
//     email:string,
//     password:string
// }

import { confirmEmail_schema, signInSchema, signUpSchema, signUpSchema_graphQl, updateUserSchema_graphQl } from "./auth.validation";
import * as z from "zod";

export type  signUpDTO = z.infer<typeof signUpSchema.body>
export type  signUpSchema_graphQlDTO = z.infer<typeof signUpSchema_graphQl>
export type  updateUserSchema_graphQlDTO = z.infer<typeof updateUserSchema_graphQl>
export type  signInDTO = z.infer<typeof signInSchema.body>
export type  confirmEmailDTO = z.infer<typeof confirmEmail_schema.body>