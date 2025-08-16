const User = require('../models/userSchema')
const bcrypt = require('bcrypt')


const loadAdminLogin = async(req,res)=>{
    try{
        res.render('admin-login',{user:req.session.admin || null})
    }catch(error){
        return res.status(500).json({success:false,message:'Server error'})
    }
}

const adminLoginController = async(req,res)=>{
    try{
        const {email,password} = req.body

        const user = await User.findOne({email:email.toLowerCase()})

        if(!user){
            return res.status(400).json({success:false,message:'User not found'})
        }
        if(!user.isAdmin){
            return res.status(400).json({success:false,message:'Not an admin account'})
        }      
        if(!user.isVerified){
            return res.status(400).json({success:false,message:'User not verified'})
        }

        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({success:false,message:'Invalid Password'})
        }

        req.session.admin ={
            id:user._id,
            username:user.username,
            email:user.email
        }

        return res.status(200).json({success:true,message:'Admin login successfull', redirect:'/admin/dashboard'})
    }catch(error){
        return res.status(500).json({success:false,message:'Server error'})
    }
}


const loadDashboard = async(req,res)=>{
    try{
        res.render('dashboard',{user:req.session.admin})
    }catch(error){
        return res.status(500).json({success:false,message:'Server error'})
    }   
}

const adminLogout = async(req,res)=>{
    req.session.destroy(err=>{
        if(err){
            return res.redirect('/admin-login')
        }
        res.clearCookie('connect.sid')
        res.redirect('/admin-login')
    })
}
    


module.exports ={
    loadAdminLogin,
    adminLoginController,
    loadDashboard,
    adminLogout
}