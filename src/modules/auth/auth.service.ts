import AuthenticationService from '../../common/service/authentication.service';
import { NextFunction, Request, Response } from "express";
import { AppError } from '../../common/utils/global.error.handeller';
import * as configService from "../../config/config.service";
import { v4 as uuidv4 } from 'uuid';
import userRepository from '../../DB/repositories/user.repository';
import { Compare, Hash } from '../../common/utils/security/hash.security';
import { encrypt } from '../../common/utils/security/encrypt.security';
import { generateOTP, sendEmail } from '../../common/utils/email/send.email';
import { emailTemplate } from '../../common/utils/email/email.template';
import { eventEmitter } from '../../common/utils/email/email.events';
import { EventEnum } from '../../common/enum/event.enum';
import { success_response } from '../../common/utils/successRes';
import RedisService from '../../common/service/redis.service';
import { ProviderEnum, RoleEnum } from '../../common/enum/user.enum';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

class AuthService {

    private readonly _userModel = new userRepository();
    private readonly _redisService = RedisService;
    private readonly _authenticationService = AuthenticationService;

    sendEmailOTP = async ({email,subject}:{email:string,subject:string}) => {
    const otpBlocked = await this._redisService.ttl(this._redisService.blocked_otp({ email }));
    if( otpBlocked && otpBlocked > 0){
        throw new Error(`you are bloked now , resend otp after ${otpBlocked} seconds `);
    }

    const otpTTL = await this._redisService.ttl(this._redisService.otp_key({ email }));
    if( otpTTL && otpTTL > 0){
        throw new Error(`you can resend otp after ${otpTTL} seconds `);
    }

    const maxOTP = await this._redisService.get(this._redisService.max_tries_otp({ email }));
    if( maxOTP >= 3 ){
        await this._redisService.set({key:this._redisService.blocked_otp({email}), value:1, ttl:60})
        throw new Error(`you have exceeded the maximum nuber of tries`);
    }

    const OTP = await generateOTP();

    eventEmitter.emit(EventEnum.confirmEmail,async()=>{
            await sendEmail({
            to: email,
            subject: "welcome to our app",
            html: emailTemplate(OTP),
        });

        await this._redisService.incr(this._redisService.max_tries_otp({email}))

        await this._redisService.set({
            key: this._redisService.otp_key({ email, subject }),
            value: Hash({ plainText:String(OTP)  , saltRounds:12 }),
            ttl: 60, //1m
        });
    })
}

    signUp = async (req: Request, res: Response, next: NextFunction) => {
        const { userName, email, password, age, phone, gender } = req.body

        if (await this._userModel.checkUser(email)) {
            throw new AppError("email already exist", 400)
        }

        const otp = await generateOTP();
        eventEmitter.emit(EventEnum.confirmEmail, async () => {
            await sendEmail({
                to: email,
                subject: "welcome to social media app , verify your account",
                html: emailTemplate(otp)
            })

            await this._redisService.set({
                key: this._redisService.otp_key({ email, subject: EventEnum.confirmEmail }),
                value: Hash({ plainText: String(otp), saltRounds: 12 }),
                ttl: 60 * 5, //5m
            });

            await this._redisService.set({
                key: this._redisService.max_tries_otp({ email }),
                value: 1,
                ttl: 60 * 5 * 3,
            })

            const user = await this._userModel.create({
                userName,
                email,
                password: Hash({ plainText: password }),
                age,
                phone: encrypt(phone),
                gender
            });

            res.status(200).json({ message: "user signup successful", user })
        })
    }

    signIn = async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body
        const user = await this._userModel.findOne({ filter: { 
            email
        } });
        if (!user || !Compare({plainText: String(password), cipherText: String(user.password)})) {
            throw new AppError("invalid email or password", 400)
        }

        const randomID = uuidv4();

        const accessToken = this._authenticationService.generateToken({
            payload: { id: user.id },
            secretOrPrivateKey: user.role == RoleEnum.USER ? configService.ACCESS_SECRET_KEY_USER! : configService.ACCESS_SECRET_KEY_ADMIN!,
            options: {
                expiresIn: "1m",
                jwtid: randomID
            }
        })

        const refreshToken = this._authenticationService.generateToken({
            payload: { id: user.id },
            secretOrPrivateKey: user.role == RoleEnum.USER ? configService.REFRESH_SECRET_KEY_USER! : configService.ACCESS_SECRET_KEY_ADMIN!,
            options: {
                expiresIn: "30d",
                jwtid: randomID
            }
        })
        res.status(200).json({ message: "user signin successful", data: { accessToken, refreshToken } })
    }

    confirmEmail = async (req:Request, res:Response) => {
        const { email, code } = req.body;

        const otpValue = await this._redisService.get(this._redisService.otp_key({ email }));

        if (!otpValue) {
            throw new Error("otp expired");
        }

        if (!Compare({ plainText: code, cipherText: otpValue })) {
            throw new Error(" invalid otp ");
        }

        const user = await this._userModel.findOneAndUpdate({
            filter: {
                email,
                confirmed: { $ne: true }, 
            },
            updateData: { confirmed: true },
        });

        if (!user) {
            throw new Error(" user not exist ");
        }

        await this._redisService.del(this._redisService.otp_key({ email }));
        success_response({ res, message: "email confirmed successfully" });
    };

    resendEmail = async (req:Request, res:Response) => {
    const { email } = req.body;

    const user = await this._userModel.findOne({
        filter: {
            email,
            confirmed: { $ne: true },  
            provider: ProviderEnum.LOCAL,
        },
    });

    if (!user) {
        throw new Error(" user not exist or already confirmed ");
    }

    await this.sendEmailOTP({email,subject:EventEnum.confirmEmail})

    success_response({ res, message: "otp sent successfully" });
    };

    signUpWithGmail = async (req:Request, res:Response) => {
    const { idToken } = req.body;

    console.log("Body received:", req.body);
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
        idToken,
        audience:
            "746397644004-0lrjg9attdmq6bfpeo5nmcpfjij20s0m.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();
    const { email, name, picture, email_verified } = payload as TokenPayload;

    let user = await this._userModel.findOne({filter: { email } });

    if (!user) {
        user = await this._userModel.create({
                email:email!,
                userName: name!,
                confirmed: email_verified!,
                provider: ProviderEnum.GOOGLE!,
        });
    }

    if (user && user.provider == ProviderEnum.LOCAL) {
        throw new Error("please logIn using the system form");
    }

    const access_token = this._authenticationService.generateToken(
        {
            payload: {
                id: user._id,
                email: user.email,
            },
            secretOrPrivateKey: configService.ACCESS_SECRET_KEY_USER!,

            options: {
                expiresIn: "1day",
            },
        },
    );
    success_response({
        res,
        message: "logged in successfully",
        data: { access_token },
    });
};



}

export default new AuthService()