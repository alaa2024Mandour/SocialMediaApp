import { Model } from "mongoose";
import { BaseRepository } from "./base.repository";
import { chatModel, IChat } from "../models/chat.model";

class ChatRepository extends BaseRepository<IChat> {
    constructor(protected readonly model : Model<IChat>  = (chatModel)){
        super(model)
    }
}

export default ChatRepository;