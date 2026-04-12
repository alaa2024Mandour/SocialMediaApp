import { GenderEnum, RoleEnum } from './../../common/enum/user.enum';
import mongoose, { Mongoose, Schema, Types } from "mongoose";

export interface IUser {
    _id: Types.ObjectId,
    firstName: String,
    lastName: String,
    userName: String,
    email: String,
    password: String,
    age: Number,
    phone?: String,
    address?:String
    gender?: GenderEnum,
    role?: RoleEnum,
    confirmed?: Boolean,
    createdAt: Date,
    updatedAt: Date
}

const userSchema = new Schema<IUser>({
    firstName: { 
        type: String, 
        required: true ,
        trim: true

    },
    lastName: { 
        type: String, 
        required: true ,
        trim: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    age: { 
        type: Number, 
        required: true 
    },
    phone: { 
        type: String 
    },
    address:{
        type:String
    },
    gender: { 
        type: String, 
        enum: Object.values(GenderEnum),
        default: GenderEnum.MALE 
    },
    role: { 
        type: String, 
        enum: Object.values(RoleEnum), 
        default: RoleEnum.USER 
    },
    confirmed: { 
        type: Boolean, 
        default: false 
    },
}, {
    timestamps: true,
    strict: true,
    toJSON: {virtuals: true,} ,
    toObject: {virtuals: true,}
})

userSchema.virtual("userName").get(function(){
    return this.firstName + " " + this.lastName;
})
.set(function (value:string){
    const [firstName, lastName] = value.split(" ");
    this.set({firstName, lastName});
})

export const userModel = mongoose.models.User || mongoose.model<IUser>("User", userSchema);