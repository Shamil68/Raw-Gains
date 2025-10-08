const bcrypt = require('bcrypt')
const User = require('../models/userSchema');
const statusCodes = require('../utils/statusCodes');


const adminLoginMiddleware = async(req,res,next)=>{
    try{
        const {email,password} = req.body

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!email || !emailRegex.test(email)){
            return res.status(statusCodes.BAD_REQUEST).json({message:'Email required & it must be valid'})

        }
        if(!password){
            return res.status(statusCodes.BAD_REQUEST).json({message:'password required'})
        }

        next()

    }catch(error){
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:'Server error'})
    }
}


// Allow only logged-in admin for pages like /dashboard
const allowOnlyLoggedInAdmin = (req,res,next)=>{
    if(!req.session.admin || !req.session.admin.id){
        return res.redirect('/admin/admin-login')
    }
    next()
}


// Prevent already logged-in admin from accessing login/signup
const preventAuthForLoggedUsers = (req,res,next)=>{
    if(req.session.admin){
        return res.redirect('/admin/dashboard')
    }
    next()
}




module.exports ={
    adminLoginMiddleware,
    allowOnlyLoggedInAdmin,
    preventAuthForLoggedUsers,
    
}