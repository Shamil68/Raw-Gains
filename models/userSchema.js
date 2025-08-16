
const mongoose = require('mongoose');
const {Schema} = mongoose

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
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
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;


