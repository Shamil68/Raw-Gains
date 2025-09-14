const mongoose = require('mongoose')
const {Schema} = mongoose


const categorySchema = new Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },

    description:{
        type:String,
        required:true,
        trim:true
    },
    status:{
        type:String,
        enum:['Active','Inactive'],
        default:'Active'        
    },
    isDeleted:{
        type:Boolean,
        default:false
    },

},{
    timeStamps:true
})


const Category = mongoose.model('Category',categorySchema)

module.exports = Category