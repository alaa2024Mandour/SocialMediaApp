import { NextFunction, Request, Response, Router } from "express";
import authMiddleware from "../../common/middleware/authentication";
import multerCloud from "../../common/middleware/multer.cloud";
import validationMid from "../../common/middleware/validation";
import { MimeEnum, StorageEnum } from "../../common/enum/multer.enum";
import storyService from "./story.service";
import { createStorySchema, storyIdSchema } from "./story.validation";

const storyRouter = Router();

const syncFilesWithBody = (req: Request, res: Response, next: NextFunction) => {
    req.body.attachments = req.files;
    next();
}

storyRouter.use(authMiddleware);

storyRouter.post(
    "/",
    multerCloud({
        storage_type: StorageEnum.memory,
        file_type: [...MimeEnum.images, ...MimeEnum.videos],
    }).array("attachments"),
    syncFilesWithBody,
    validationMid(createStorySchema),
    storyService.createStory
)

storyRouter.get("/", storyService.getStories)

storyRouter.get("/my", storyService.getMyStories)

storyRouter.post("/:storyId/view", validationMid(storyIdSchema), storyService.viewStory)

storyRouter.delete("/:storyId", validationMid(storyIdSchema), storyService.deleteStory)

export default storyRouter;
