import jwt, { JwtPayload, PrivateKey, Secret, SignOptions, VerifyOptions } from "jsonwebtoken";
import { Types } from "mongoose";

interface userPayload extends JwtPayload {
    id: Types.ObjectId;
}

class AuthenticationService {
    public generateToken = (
        {payload,secretOrPrivateKey,options={}} :
        { 
        payload: string | Buffer | object,
        secretOrPrivateKey: Secret | PrivateKey,
        options?: SignOptions,
    }) : string => {
        return jwt.sign(payload,secretOrPrivateKey,options)
    }

    public verifyToken = (
        {token,secretOrPublicKey,options={}} : 
        {
            token: string,
            secretOrPublicKey: Secret ,
            options?: VerifyOptions 
        }) : userPayload => {
        return jwt.verify(token,secretOrPublicKey,options) as userPayload
    }

}

export default new AuthenticationService();