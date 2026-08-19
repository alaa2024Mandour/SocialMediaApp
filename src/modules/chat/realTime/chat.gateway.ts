import { Server, Socket } from "socket.io";
import chatEvents from "./chat.events";

class ChatGateway{
    constructor(){}

    registerEvent= async (socket:Socket,io:Server)=>{
        chatEvents.sendMessage(socket,io)
        chatEvents.joinRoom(socket,io)
        chatEvents.sendGroupMessage(socket, io)
    }
}

export default new ChatGateway()