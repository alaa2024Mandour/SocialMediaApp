import { AppError } from "../utils/global.error.handeller";

export const authorization = (roles:string[],role:string) => {
    if(!roles.includes(role)){
        throw new AppError("unAuthorized");
    }
}