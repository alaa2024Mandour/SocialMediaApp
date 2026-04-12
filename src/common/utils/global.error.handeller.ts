import  type { Request, Response,  Application, NextFunction } from 'express';


export class AppError extends Error {
    constructor(public message:any, public status_code?:number){
        super(message);
        this.message = message;
        this.status_code = status_code;
    }
}

export const global_error_handeller=((error:AppError,req:Request,res:Response,next:NextFunction) => {
        const statusCode = error.status_code as number || 500;
        res.status(statusCode)
        .json({
            message:error.message, 
            status:statusCode,
            stack:error.stack,
        });
    });