import { createClient } from "@redis/client";
import { RedisClientType } from "redis";
import { REDIS_URL } from "../../config/config.service";
import { Types } from "mongoose";
import { EventEnum } from "../enum/event.enum";

class RedisService{
    private readonly client : RedisClientType
    constructor(){
        this.client = createClient({
            url: REDIS_URL!
        });
        this.handelEvent();
    }

    handelEvent(){
        this.client.on("error",(error)=>{
            console.log("Redis Connected Faild 😱",error);
        })
    }

    async connect(){
        await this.client.connect();
        console.log("Redis Connected Successfully 👏");
        
    }

    revokedToken_key = ({ userId, jti } : {userId:Types.ObjectId, jti:number}) => {
        return `revokedToken::${userId}::${jti}`;
    };
    
    getUser_revokedKeys = ({ userId } : {userId:Types.ObjectId}) => {
        return `revokedToken::${userId}`;
    };
    
    profile_key = ({ userId } : {userId:Types.ObjectId}) => {
        return `profile::${userId}`;
    };
    
    otp_key = ({ email, subject = EventEnum.confirmEmail } : {email:string, subject?:string}) => {
        return `otp::${email}::${subject}`;
    };
    
    max_tries_otp = ({ email }: {email:string}) => {
        return `${this.otp_key({email})}::max_tries`;
    };
    
    blocked_otp = ({ email }: {email:string}) => {
        return `${this.otp_key({email})}::blocked`;
    };
    
    set = async({key,value,ttl}:{key:string,value:string|object|number,ttl:number})=>{
        try {
            const data = typeof value == "string" ? value : JSON.stringify(value);
            return ttl ? await this.client.set(key,data,{EX:ttl}) : await this.client.set(key,data)
        } catch (error) {
            console.log({error,mes:"error on set cash operation"});
            
        }
    }
    update = async({key,value,ttl}:{key:string,value:string,ttl:number})=>{
        try {
            if(await this.client.exists(key)) return 0;
            return await this.set({key,value,ttl});
        } catch (error) {
            console.log({error,mes:"error on update cash operation"});
            
        }
    }
    get = async(key:string)=>{
        try {
            const value = await this.client.get(key);
            if (value === null) return null;
            try {
                return JSON.parse(value)  // if the type of data is an object
            } catch (error) {
                return value // if the last line return error so the data was string
            }
        } catch (error) {
            console.log({error,mes:"error on get cash operation"});
            
        }
    }
    ttl = async(key:string)=>{
        try {
            return await this.client.ttl(key)
        } catch (error) {
            console.log({error,mes:"error on ttl cash operation"});
            
        }
    }
    exists = async(key:string)=>{
        try {
            return await this.client.exists(key)
        } catch (error) {
            console.log({error,mes:"error on exsits cash operation"});
            
        }
    }
    expire = async({key,ttl}:{key:string,ttl:number})=>{
        try {
            return await this.client.expire(key, ttl)
        } catch (error) {
            console.log({error,mes:"error on expire cash operation"});
            
        }
    }
    del = async(key:string)=>{
        try {
            return await this.client.del(key)
        } catch (error) {
            console.log({error,mes:"error on del cash operation"});
            
        }
    }
    
    keys = async(pattern:string)=>{
        try {
            return await this.client.keys(`${pattern}*`)
        } catch (error) {
            console.log({error,mes:"error on keys cash operation"});
            
        }
    }
    
    
    incr = async(key:string)=>{
        try {
            return await this.client.incr(key)
        } catch (error) {
            console.log({error,mes:"error on increament cash operation"});
            
        }
    }
    
}

export default new RedisService()