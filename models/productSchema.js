const mongoose = require('mongoose')
const {Schema} = mongoose

const productSchema = new Schema({
    productName:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true

    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    regularPrice:{
        type:Number,
        required:true
    },
    salePrice:{
        type:Number,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    productImage:{
        type:[String],
        required:true
    },
    retings:{
        type:Number,
        default:0
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    isListed:{
        type:Boolean,
        default:true
    },
    status:{
        type:String,
        enum:['Available','Out of stock','Discontinued'],
        default:'Available',
        required:true
    },
     stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    }

},{timestamps:true})


const Product = mongoose.model('Product',productSchema)

module.exports = Product