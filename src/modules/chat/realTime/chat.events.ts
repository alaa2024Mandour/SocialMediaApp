import { Socket } from "socket.io";
import chatService from "../chat.service";
import { chatEventsNamesEnum } from "../events.names.enum";

class ChatEvents{
    constructor(){}

    sayHiEvent=(socket:Socket)=>{
        socket.on("sayHi",(data)=>{
            chatService.sayHi(data)
        })
    }

    sendMessage=(socket:Socket)=>{
        socket.on(chatEventsNamesEnum.sendMessage,(data)=>{
            chatService.sendMessage(data)
        })
    }
}

export default new ChatEvents()