import { Server, Socket } from "socket.io";
import chatService from "../chat.service";
import { chatEventsNamesEnum } from "../events.names.enum";

class ChatEvents{
    constructor(){}

    sayHiEvent=(socket:Socket)=>{
        socket.on("sayHi",(data)=>{
            chatService.sayHi(data)
        })
    }

    sendMessage= async (socket:Socket,io:Server)=>{
        socket.on(chatEventsNamesEnum.sendMessage,(data)=>{
            chatService.sendMessage(data,socket,io)
        })
    }

    joinRoom= async (socket:Socket,io:Server)=>{
        socket.on(chatEventsNamesEnum.joinRoom,(data)=>{
            chatService.sendMessage(data,socket,io)
        })
    }
}

export default new ChatEvents()