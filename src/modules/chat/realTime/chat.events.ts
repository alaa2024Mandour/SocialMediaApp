import { Server, Socket } from "socket.io";
import chatService from "../chat.service";
import { chatEventsNamesEnum } from "../events.names.enum";

class ChatEvents {
    constructor() { }

    sendMessage = async (socket: Socket, io: Server) => {
        socket.on(chatEventsNamesEnum.sendMessage, (data) => {
            chatService.sendMessage(data, socket, io)
        })
    }

    joinRoom = async (socket: Socket, io: Server) => {
        socket.on(chatEventsNamesEnum.joinRoom, (data) => {
            chatService.joinRoom(data, socket, io)
        })
    }

    sendGroupMessage = async (socket: Socket, io: Server) => {
        socket.on(chatEventsNamesEnum.sendGroupMessage, (data) => {
            chatService.sendGroupMessage(data, socket, io)
        })
    }
}

export default new ChatEvents()