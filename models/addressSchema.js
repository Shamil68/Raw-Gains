const mongoose = require('mongoose')
const {Schema} = mongoose 

const addressSchema = new Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true   
    },

    addressType:{
        type:String,
        required:true,
        enum:['Home','Work','Other']
    },

    fullName:{
        type:String,
        required:true,
    },

    country:{
        type:String,
        required:true
    },

    state:{
        type:String,
        required:true
    },

    city:{
        type:String,
        required:true
    },

    landmark:{
        type:String,
        required:true
    },

    streetAddress:{
        type:String,
        required:true
    },

    pincode: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    alternativePhone: {
        type: String
    }

},{timeStamps:true})

const Address = mongoose.model('Address', addressSchema)

module.exports = Address