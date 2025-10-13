const User = require('../../models/userSchema')
const bcrypt = require("bcrypt");
const statusCodes = require('../../utils/statusCodes')
const nodemailer = require('nodemailer')
// const sharp = require('sharp')
// const path = require('path')
const dotenv = require('dotenv');
const { session } = require('passport');
dotenv.config();


const loadProfile = async(req,res)=>{
    try{
        
        const user = await User.findById(req.session.user._id).select('username email avatar password googleId')

        // if(!user){
        //     return res.redirect('login')
        // }

// console.log("User Google ID:", user.googleId);

        res.render('userProfile',{
            user:{
                username:user.username,
                email:user.email,
                avatar:user.avatar,
                googleId:user.googleId,
                password:user.password
            }
        })
        
    }catch(error){
          console.error('Error fetching profile:', error);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
    }
}



const loadVerifyEmailPage = async(req,res)=>{
    try{

        res.render('verifyCurrentEmail')

        }catch(error){
            return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
        }
    } 



const verifyEmailController = async(req,res)=>{
    try{

        const {currentEmail} = req.body

        // const userId = req.session.user._id

        const user = await User.findById(req.session.user._id).select('email')

        if(!currentEmail){
            return res.status(statusCodes.BAD_REQUEST).json({success:false,message:'Invalid request'})
        }

        if(currentEmail !== user.email){
            return res.status(statusCodes.BAD_REQUEST).json({success:false,message:'Email does not match'})
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        req.session.otp = otp
        req.session.otpExpires = Date.now() + 60 * 1000


        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD
            }
        })

        const mailInfo = {
            from:process.env.NODEMAILER_EMAIL,
            to:user.email,
            subject:'Update email OTP',
            text:`Your update email OTP is ${otp}, it expires 1 minute from now` 
        }

        try{
            await transporter.sendMail(mailInfo)
            console.log(`OTP sent to ${user.email}: ${otp}`);

            
        }catch(error){
            console.log(error);
            
            return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
        }


        return res.status(statusCodes.OK).json({success:true,message:'Email verified',redirect:'/update-email-otp'})

    }catch(error){
        console.log(error);
        
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
    }


}



const loadUpdateEmailOtp = async(req,res)=>{
    try{
        
        res.render('updateEmailOtp')
    }catch(error){
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
    }
    
}

 
const updateEmailOtpController = async(req,res)=>{

    try{

        if(!req.session.user || !req.session.otp || !req.session.otpExpires){
            return res.status(statusCodes.UNAUTHORIZED).json({success:false,message:'Unauthorized'})
        }

        const {otp} = req.body

        if(!otp){
            return res.status(statusCodes.BAD_REQUEST).json({success:false,message:'OTP is required'})
        }

        if(otp !== req.session.otp){
            return res.status(statusCodes.BAD_REQUEST).json({success:false,message:'Invalid OTP'})
        }

        if(Date.now() > req.session.otpExpires){
            delete req.session.otp
            delete req.session.otpExpires

            return res.status(statusCodes.BAD_REQUEST).json({success:false,message:'OTP expired'})
        }

        delete req.session.otp
        delete req.session.otpExpires

        return res.status(statusCodes.OK).json({success:true,message:'OTP verified successfully',redirect:'/update-email'})


    }catch(error){
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
    }
}



const updateEmailResendOtpController = async(req,res)=>{

    try{
        
        const userId = req.session.user._id
        const user = await User.findById(userId).select('email')

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        req.session.otp = otp
        req.session.otpExpires = Date.now() + 60 * 1000


        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD
            }
        })

        const mailInfo ={
            from:process.env.NODEMAILER_EMAIL,
            to:user.email,
            subject:'Update email resend-OTP',
            text:`Your update email resend-OTP is ${otp}, it expires 1 minute from now` 
    }

    try{
        await transporter.sendMail(mailInfo)
        console.log(`Resend OTP to ${user.email}:${otp} `);

    }catch(error){
        console.log(error);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
    }

    return res.status(statusCodes.OK).json({success:true,message:'OTP resend successfully',redirect:'/update-email'})


    }catch(error){
        console.log(error);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
    }
}



const loadUpdateEmail = async(req,res)=>{

    try{
        
        res.render('updateEmail')

    }catch(error){
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
    }
}



const updateEmailController = async(req,res)=>{

    try{   
        
        const {newEmail,confirmEmail} = req.body
        const user = await User.findById(req.session.user._id).select('email')

        if(!newEmail || !confirmEmail){
            return res.status(statusCodes.BAD_REQUEST).json({success:false,message:'Email required'})
        }

        if(newEmail !== confirmEmail){
            return res.status(statusCodes.BAD_REQUEST).json({success:false,message:'Emails do not match'})
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            return res.status(statusCodes.BAD_REQUEST).json({success:false, message: 'Please enter a valid email' });
        }


        if(newEmail === user.email){
            return res.status(statusCodes.BAD_REQUEST).json({success:false,message:'New email cannot be same as the current email'})
        }

        user.email = newEmail
        await user.save()

        return res.status(statusCodes.OK).json({success:true,message:'Email updated successfully', redirect:'/profile'})


    }catch(error){
        console.log(error);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
        

    }
}




const loadUpdatePasswordPage = async(req,res)=>{
    try{

        res.render('changePassword')

    }catch(error){
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
    }
}



const updatePasswordController = async(req,res)=>{
    try{


        const {currentPassword,newPassword,confirmPassword} = req.body

        const userId = req.session.user._id; // or whatever you stored in session
        const user = await User.findById(userId).select('password googleId')

        if(!user || user.googleId){
            return res.status(statusCodes.BAD_REQUEST).json({success:false,message:'Cannot change password for google account'})
        }

        if(!currentPassword || !newPassword || !confirmPassword){
            return res.status(statusCodes.BAD_REQUEST).json({success:false,message:'All fields are required'})
        }

        if(newPassword.length < 6){
            return res.status(statusCodes.BAD_REQUEST).json({success:false,message:'Password must be include minimum 6 characters'})
        }

        if(confirmPassword !== newPassword){
            return res.status(statusCodes.BAD_REQUEST).json({success:false,message:'Password do not match'})
        }

        if(currentPassword === newPassword){
            return res.status(statusCodes.BAD_REQUEST).json({success:false,message:'New password & Current password cannot be the same'})
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password)

        if(!isMatch){
            return res.status(statusCodes.BAD_REQUEST).json({success:false,message:'Current passowrd is incorrect'})
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        user.password = hashedPassword
        await user.save()

        return res.status(statusCodes.OK).json({success:true,message:'Password updated successfully',redirect:'/profile'})

    }catch(error){
          console.error('Update Password Error:', error);

        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
    }
}



const updateProfilePicture = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(statusCodes.BAD_REQUEST).json({success:false, message: 'No file uploaded' });
        }

        const user = await User.findById(req.session.user._id);
        if (!user) {    
            return res.status(statusCodes.BAD_REQUEST).json({success:false, message: 'User not found' });
        }

        const newAvatar = req.file.filename;
        user.avatar = `/uploads/${newAvatar}`;
        await user.save();
    
        return res.status(statusCodes.OK).json({success:true, message: 'Profile picture updated successfully', newAvatar });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({succes:false, message: 'Server error' });
    }
};


const loadEditProfile = async(req,res)=>{

    try{

        const user = await User.findById(req.session.user._id);

        res.render('editProfile',{user})

    }catch(error){
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
    }
}


const editProfileController = async(req,res)=>{

    try{

        const {username} = req.body

        const user = await User.findById(req.session.user._id)

        if(!username){
            return res.status(statusCodes.BAD_REQUEST).json({sucess:false,message:'Username required'})
        }

        if(username.length < 3){
            return res.status(statusCodes.BAD_REQUEST).json({success:false,message:'Userame must include minimum 3 characters'})

        }

        user.username = username
        await user.save()


        return res.status(statusCodes.OK).json({success:false,message:'Username updated successfully',redirect:'/profile'})

    }catch(error){
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
    }
}



module.exports = {
    loadProfile,
    loadVerifyEmailPage,
    verifyEmailController,
    loadUpdateEmailOtp,
    updateEmailOtpController,
    updateEmailResendOtpController,
    loadUpdateEmail,
    updateEmailController,
    loadUpdatePasswordPage,
    updatePasswordController,
    updateProfilePicture,
    loadEditProfile,
    editProfileController
}