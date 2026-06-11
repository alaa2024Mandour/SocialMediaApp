import { Response } from 'express';
export const success_response = ({
    res,
    status = 200,
    message = "done",
    data = undefined
}:
{
    res:Response|any,
    status? :number,
    message? :string,
    data ?:any|undefined
}) => {
    return res.status(status).json({message,data})
}