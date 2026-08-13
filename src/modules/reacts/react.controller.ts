import { NextFunction, Request, Response, Router } from "express";
import validationMid from "../../common/middleware/validation";
import authMiddleware from "../../common/middleware/authentication";
import { createReactSchema } from "./react.validation";
import reactService from "./react.service";

const reactRouter = Router()



reactRouter.post(
    "/createReact", 
    validationMid(createReactSchema),
    authMiddleware,
    reactService.createReact)


export default reactRouter