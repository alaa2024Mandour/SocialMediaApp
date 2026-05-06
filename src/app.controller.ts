import express from 'express';
import  type { Request, Response,  Application, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import {rateLimit} from 'express-rate-limit';
import { PORT } from './config/config.service';
import { AppError, global_error_handeller } from './common/utils/global.error.handeller';
import authRouter from './modules/auth/auth.controller';
import { checkConnectionDB } from './DB/connectionDB';
import userRouter from './modules/users/user.controller';
import  RedisService  from './common/service/redis.service';
import UserRepository from './DB/repositories/user.repository';
import { userModel } from './DB/models/user.model';

const app:Application = express();
const port:number = PORT;

const bootstrap =  () => { 

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again after 15 minutes',
        statusCode: 429, // 429 status = Too Many Requests (RFC 6585)
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });

    app.use(cors());
    app.use(express.json());
    // app.use(helmet());
    app.use(limiter);

    checkConnectionDB();
    RedisService.connect()
    
    app.use("/auth",authRouter)
    app.use("/users",userRouter)

    async function test (){
        const user = await new UserRepository().findOne({
            filter:{firstName:"Alaa"}
        })
        console.log({user});
    }
    // test()

    app.get("/",(req:Request,res:Response)=>{
        res.status(200).json({message:"Welcome to the Social Media API"});
    })

    app.use("{/*demo}",(req:Request,res:Response,next:NextFunction)=>{
        throw new AppError(`The route ${req.originalUrl} does not exist, Method ${req.method} is not supported`,404);
    })


    app.use(global_error_handeller);

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

export default bootstrap;