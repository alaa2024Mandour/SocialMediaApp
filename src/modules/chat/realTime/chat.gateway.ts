import { Socket } from "socket.io";
import chatEvents from "./chat.events";

class ChatGateway{
    constructor(){}

    registerEvent=(socket:Socket)=>{
        chatEvents.sayHiEvent(socket)
        chatEvents.sendMessage(socket)
    }
}

export default new ChatGateway()