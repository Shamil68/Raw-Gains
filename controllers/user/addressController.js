// const User = require('../../models/userSchema')
const { response } = require('express')
const Address = require('../../models/addressSchema')
const statusCodes = require('../../utils/statusCodes')

const loadAddressPage = async(req,res)=>{


    try{

        const addresses = await Address.find({userId:req.session.user._id})

        res.render('address',{
            title:'My Addresses',
            addresses
        })


    }catch(error){

        console.log(error);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
    }
}


const loadAddAddress = async(req,res)=>{

    try{

        res.render('add-address',{
            title:'Add new address'
        })
    }catch(error){
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
    }
}


const addAddresscontroller = async(req,res)=>{

    try{

        const {addressType, fullName, country, state, city, landmark, streetAddress, pincode, phone, email, alternativePhone} = req.body

        const newAddress = new Address({
            userId: req.session.user._id,
            addressType,
            fullName,
            country,
            state,      
            city,
            landmark,
            streetAddress,
            pincode,
            phone,
            email,
            alternativePhone
        })

        await newAddress.save()

        res.status(statusCodes.OK).json({success:false,message:'Address added successfully', redirect:'/addresses'})

    }catch(error){
        console.log(error);
        
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})

    }

}


const deleteAddress = async(req,res)=>{

    try{
        const addressId = req.params.id
        const userId = req.session.user._id

        const address = await Address.findOneAndDelete({_id:addressId,userId})

        if(!address){            
            return res.status(statusCodes.BAD_REQUEST).json({success:false,message:'Address not found'})
        }

        return res.status(statusCodes.OK).json({success:true,message:'Address deleted successfully',redirect:'/addresses'})

    }catch(error){
        console.log(error);
        
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
    }
}
    



module.exports = {
    loadAddressPage,
    loadAddAddress,
    addAddresscontroller,
    deleteAddress
}