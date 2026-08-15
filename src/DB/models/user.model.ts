import { GenderEnum, ProviderEnum, RoleEnum } from './../../common/enum/user.enum';
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
    provider: ProviderEnum,
    profilePic?: String,
    confirmed?: Boolean,
    deletedAt?: Date,
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
        required: function(){
            return this.provider == ProviderEnum.GOOGLE ? false :true
        }
    },
    age: { 
        type: Number, 
        required: true 
    },
    phone: { 
        type: String ,
        required: function(){
            return this.provider == ProviderEnum.GOOGLE ? false :true
        }
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
    provider: { 
        type: String, 
        enum: Object.values(ProviderEnum), 
        default: ProviderEnum.LOCAL
    },
    profilePic: String,
    confirmed: { 
        type: Boolean, 
        default: false 
    },
    deletedAt:Date
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

// userSchema.pre("findOne",function(){
//     console.log("--------findOne---------");
//     console.log(this.getQuery());
//     const {paranoid , ...rest} = this.getQuery()

//     if(paranoid==false){
//         this.setQuery({...rest})
//     }
//     else{
//         this.setQuery({deleteAt:{$exists:false},...rest})
//     }
// })

export const userModel = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

