import admin from "firebase-admin"
import {readFileSync} from "node:fs"
import {resolve} from "node:path"
import RedisService from "./redis.service";
import { unknown } from "zod";
import { Types } from "mongoose";
class NotificationService {
    private readonly client : admin.app.App;
    private readonly _redisService = RedisService;
    constructor(){
        const serviceAccount = JSON.parse(readFileSync(resolve(__dirname,"../../config/socialapp-487713-firebase-adminsdk-fbsvc-7a3fdf198c.json")) as unknown as string) ;

        this.client = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

    async sendNotification(
        {
            userId,
            token,
            data
        }:
        {
            userId:Types.ObjectId,
            token:string,
            data:{title:string,body:string}
        }
    ){
        const message = {token,data}

        try {
            await this.client.messaging().send(message)
        } catch (error: any) {
            if (error?.errorInfo?.code === 'messaging/registration-token-not-registered') {
                await this._redisService.removeFCM(userId, token)
                console.log({message: "there is one token removed", token})
            }
        }

    }

    async sendNotifications(
        {
            userId,
            tokens,
            data
        }:
        {
            userId:Types.ObjectId,
            tokens:string[],
            data:{title:string,body:string}
        }
    ){
        await Promise.all(tokens.map((token)=>{
            return this.sendNotification({userId,token,data})
        }))
    }
}

export default new NotificationService()