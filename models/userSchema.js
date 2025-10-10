
const mongoose = require('mongoose');
const {Schema} = mongoose

const userSchema = new Schema({
    username: {
        type: String,
        required:true,
        unique: true,
        trim: true
    },

    email: {
        type: String,
        required:true,
        unique: true,
        lowercase: true,
        trim: true
    },

    phone: {
        type: String,
        required:true,
        unique: true
    },

    password: {
        type: String,
        required:true
    },

    googleId: {
         type: String,
         default:null
    },

    otp: {
        type: String,
        default: null
    },

    expireOtp: {
        type: Date,
        default: null
    },

    isAdmin:{
        type:Boolean,
        default:false
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    isBlocked:{
        type:Boolean,
        default:false
    },

    role:{
        type:String,
        enum:['admin','user'],
        default:'user'

    },

    avatar:{
        type:String,
        required:false,
        default:'/images/default-avatar.png'
    }

}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;


