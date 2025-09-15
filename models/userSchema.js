
const mongoose = require('mongoose');
const {Schema} = mongoose

const userSchema = new Schema({
    username: {
        type: String,
        required: function(){
            return !this.googleId
        },
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
        required: function(){
            return !this.googleId
        },
        unique: true
    },
    password: {
        type: String,
        required: function(){
            return !this.googleId
        }
    },
    googleId: {
         type: String 
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

    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;


