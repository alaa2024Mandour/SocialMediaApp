import { Server } from "socket.io";
import redisService from "../../common/service/redis.service";
import {Server as HttpServer} from "http"
import { checkUser } from "../../common/middleware/authentication";
import chatGateway from "../chat/realTime/chat.gateway";
class SocketGateway{
    constructor(){}

    initIo=(httpServer:HttpServer)=>{
            const io = new Server(
        httpServer,
        {
            cors: {
                origin: "*"
            }
        }
    )
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.authorization ||socket.handshake.headers.authorization ;
            const { user } = await checkUser(token)            
            socket.data.user = user
            next()
        } catch (error:any) {
            next(error)
        }
    })

    io.on(
        "connection",
        async (socket) => {
            const userId = socket.data.user._id;
            const socketId = socket.id
            
            await chatGateway.registerEvent(socket,io)

            await redisService.addSocketIo(userId,socketId)

            console.log({userSockets:await redisService.getSocketIos(userId)});
            
            socket.on("disconnect",async () => {
                await redisService.removeSocketIo(userId,socketId)
                console.log({userSockets:await redisService.getSocketIos(userId)});
            })

            
            socket.on(
                "eventName",
                (data, /*cb*/) => {
                    console.log({ data })
                    // socket.emit("emitEvent",{message:"emit message"}); // return response to only refreshed tap
                    //socket.broadcast.emit("emitEvent",{message:"emit message"}); // return response to all taps except refreshed tap
                    // io.emit("emitEvent",{message:"emit message"}); // return response to all taps
                    // cb("welcome in our backend");
                    // socket.to([socketIds.at(-1)!,socketIds.at(-2)!]).emit("emitEvent",{message:"emit message"}); // send message to specific user / users
                    // socket.except(socketIds.at(-1)!).emit("emitEvent",{message:"emit message"}); // except send message to specific user and the sender
                    // io.except(socketIds.at(-1)!).emit("emitEvent",{message:"emit message"}); // except send message to specific user
                }
            )
        }
    )
    }
}

export default new SocketGateway()