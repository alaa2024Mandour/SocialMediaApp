import { GraphQLEnumType, GraphQLError } from 'graphql';
import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { AppError } from "../utils/global.error.handeller";
import { error } from 'node:console';

type reqType = keyof Request
type schemaType = Partial<Record<reqType, ZodType>>

const validationMid = (schema: schemaType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        let errorsResult = []
        
        for (const key of Object.keys(schema) as reqType[]) {
            if (!schema[key]) continue;
            // if (req?.file) {
            // req.body.attachment = req.file
            // }
            // if (req?.files) {
            //     req.body.attachments = req.files
            // }
            // console.log("-----check validation-----");
            // console.log(req.body.attachments);

            const result = schema[key].safeParse(req[key])

            if (!result.success) {
                errorsResult.push({
                    key,
                    errors: result.error.issues.map((issue) => ({
                        path: issue.path[0],
                        message: issue.message,
                    }))
                })
            }
        }
        if (errorsResult.length > 0) {
            throw new AppError(errorsResult, 400)
        }
        next()
    }
}
export const validationMid_graphql = (schema: ZodType, data:any) => {
        let errorsResult = []
        const result = schema.safeParse(data)

            if (!result.success) {
                errorsResult.push({
                    errors: result.error.issues.map((issue) => ({
                        path: issue.path[0],
                        message: issue.message,
                    }))
                })
            }

            if(errorsResult.length){
                throw new GraphQLError(
                    "validation error",
                    {
                        extensions:{
                            code:"BAD_REQUEST",
                            status:400,
                            message:"there is some validation errors",
                            error:errorsResult
                        }
                    }
                )
                
            }
}

export default validationMid;