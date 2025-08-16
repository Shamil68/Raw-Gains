const bcrypt = require('bcrypt')
const User = require('../models/userSchema')


const adminLoginMiddleware = async(req,res,next)=>{
    try{
        const {email,password} = req.body

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!email || !emailRegex.test(email)){
            return res.status(400).json({message:'Email required & it must be valid'})

        }
        if(!password){
            return res.status(400).json({message:'password required'})
        }

        next()

    }catch(error){
        return res.status(500).json({message:'Server error'})
    }
}

const allowOnlyLoggedInAdmin = (req,res,next)=>{
    if(!req.session.admin || !req.session.admin.id){
        return res.redirect('/admin-login')
    }
    next()
}

const preventAuthForLoggedUsers = (req,res,next)=>{
    if(req.session.admin){
        return res.redirect('/dashboard')
    }
    next()
}

module.exports ={
    adminLoginMiddleware,
    allowOnlyLoggedInAdmin,
    preventAuthForLoggedUsers
}