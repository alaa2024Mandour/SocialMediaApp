import { Model } from "mongoose";
import { BaseRepository } from "./base.repository";
import { IStory, storyModel } from "../models/story.model";

class StoryRepository extends BaseRepository<IStory> {
    constructor(protected readonly model: Model<IStory> = storyModel) {
        super(model)
    }
}

export default StoryRepository;
