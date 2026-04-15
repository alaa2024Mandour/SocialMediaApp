import {EventEmitter} from "node:events"
import { EmailEnum } from "./emial.enum.ts"

export const eventEmitter = new EventEmitter

eventEmitter.on(EmailEnum.confirmeEmail,async(fun)=>{
    await fun()
})

