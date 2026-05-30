import { Model } from "mongoose";
import { IComment, commentModel } from "../models/comment.model";
import { BaseRepository } from "./base.repository";

class CommentRepository extends BaseRepository<IComment> {
    constructor(protected readonly model : Model<IComment>  = (commentModel)){
        super(model)
    }

}

export default CommentRepository;