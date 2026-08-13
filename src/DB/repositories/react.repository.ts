import { Model } from "mongoose";
import { BaseRepository } from "./base.repository";
import { IReact, reactModel } from "../models/react.model";

class ReactRepository extends BaseRepository<IReact> {
    constructor(protected readonly model : Model<IReact>  = (reactModel)){
        super(model)
    }
}

export default ReactRepository;