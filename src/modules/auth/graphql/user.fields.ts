import {allUsersType, userType } from "./user.types"
import authService from "../auth.service"
import authMiddleware, { authMiddleware_graphql } from "../../../common/middleware/authentication"
import { authorization } from "../../../common/middleware/authorization"
import { createUserARG, updateUserARG } from "./user.args"
import { validationMid_graphql } from "../../../common/middleware/validation"
import { signUpSchema_graphQl, updateUserSchema_graphQl } from "../auth.validation"
import { resolve } from "node:dns"


export class UserFields {

    query = () => {
        return {
            getUserById: {
                type: userType,
                resolve: async (parent: any, args: any, context:any) => {
                    const {user} = await authMiddleware_graphql(context.req.headers.authorization)
                    authorization(["admin","user"],user.role!)
                    return authService.getUserById(user._id)
                }
            },

            getUsersAllUsers:{
                type:allUsersType,
                resolve:async ()=>{
                    return authService.getUsers()
                }
            }
        }
    }

    mutation=()=>{
        return {
            createUser: {
                type: userType,
                args: {
                    ...createUserARG
                },
                resolve: async (parent:any,args:any)=>{
                    validationMid_graphql(signUpSchema_graphQl,args);
                    return await authService.signUp_graphQl(args)
                }
            },

            updateUser: {
                type: userType,
                args: {
                    ...updateUserARG
                },
                resolve: async (parent:any,args:any,context:any)=>{
                    validationMid_graphql(updateUserSchema_graphQl,args);
                    const {user} = await authMiddleware_graphql(context.req.headers.authorization)
                    return await authService.updateUserProfile(user,args)
                }
            },

            deleteUser: {
                type: userType,
                resolve: async (parent:any,args:any,context:any)=>{
                    validationMid_graphql(updateUserSchema_graphQl,args);
                    const {user} = await authMiddleware_graphql(context.req.headers.authorization)
                    return await authService.deleteUserProfile(user._id)
                }
            }

        }
    }
}

export default new UserFields()