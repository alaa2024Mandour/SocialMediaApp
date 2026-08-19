import cron, { ScheduledTask } from "node-cron";
import StoryRepository from "../../DB/repositories/story.repository";
import { S3Service } from "../../common/service/s3.service";

class StoryCleanupService {
    private readonly _storyModel = new StoryRepository();
    private readonly _s3Service = new S3Service();
    private task?: ScheduledTask;

    start = () => {
        if (this.task) return;

        this.deleteExpiredStories();
        this.task = cron.schedule("0 * * * *", this.deleteExpiredStories);
    }

    private deleteExpiredStories = async () => {
        try {
            const expiredStories = await this._storyModel.find({
                filter: {
                    expiresAt: { $lte: new Date() }
                }
            })

            for (const story of expiredStories) {
                if (story.attachments.length) {
                    await this._s3Service.deleteFiles(story.attachments);
                }

                await story.deleteOne();
            }
        } catch (error) {
            console.log({ error, message: "error while deleting expired stories" });
        }
    }
}

export default new StoryCleanupService();
