const User = require('../../models/userSchema');
const bcrypt = require('bcrypt');
const Product = require('../../models/productSchema')
const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
dotenv.config();


const loadSignupPage = async(req,res)=>{
    try{
        res.render('signup')
    }catch(error){
        return res.status(500).json({success:false,message:'Server error'})
    }
}


const signupController = async (req, res) => {
    try {
        const { username, email, phone } = req.userData;

        // console.log(`Creating user: username=${username}, email=${email}, phone=${phone}`); // Debug log

        const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }, { phone }] });
        if (existingUser) {
            console.log(`User already exists: email=${email}`); // Debug log
            return res.status(400).json({ message: 'User already exists' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expireOtp = new Date(Date.now() + 1 * 60 * 1000);

        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD
            }

        })

        const mailInfo = {
            from:process.env.NODEMAILER_EMAIL,
            to:email.toLowerCase(),
            subject:'RawGains signup OTP',
            text:`Your OTP for signup is ${otp}. It expires in 1 minute`
        }

        try{
            await transporter.sendMail(mailInfo)
            console.log(`OTP sent to ${email.toLowerCase()}: ${otp}`);

        }catch(error){
            return res.status(500).json({success:false,message:'Server error'})
        }



        const newUser = new User({
            username,
            email: email.toLowerCase(),
            phone,
            password: req.hashedPassword,
            otp,
            expireOtp
        });

        await newUser.save();
        console.log(`User created, OTP for ${email.toLowerCase()}: ${otp}`);

        return res.status(200).json({ success: true, message: 'User created and OTP sent successfully', redirect: `/otp?email=${encodeURIComponent(email.toLowerCase())}` });
    } catch (error) {
        // console.error('Signup error:', error); // Debug log
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};


const loadSignupOtpPage = async(req,res)=>{

    try{
    const email = req.query.email ? decodeURIComponent(req.query.email).trim().toLowerCase() : '';
    if (!email) {
        return res.status(400).render('signup', { error: 'Email is required for OTP verification' });
    }
    res.render('otp', { email });

    }catch(error){
        return res.status(500).json({success:false,message:'Server error'})
    }
}

const signupOtpController = async (req, res) => {
    try {
        const { email, otp } = req.body;
        console.log(`Verifying OTP for email: ${email}, OTP: ${otp}`); // Debug log
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log(`No user found for email: ${email}`); // Debug log
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        if (user.otp !== otp || user.expireOtp < Date.now()) {
            console.log(`Invalid or expired OTP for email: ${email}`); // Debug log
            return res.status(400).json({ success: false, message: 'Invalid or OTP expired' });
        }

        user.otp = null;
        user.expireOtp = null;
        user.isVerified = true;
        await user.save();

        req.session.user ={
            id:user._id,
            email:user.email,
            username:user.username
        }

        req.session.user ={id:user._id,email:user.email,username:user.username}

        console.log(`User verified: ${email}`); // Debug log
        return res.status(200).json({ success: true, message: 'User verified successfully', redirect: '/home'});
    } catch (error) {
        console.error('Verify OTP error:', error); // Debug log
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const signupResendOtpController = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(`Resending OTP for email: ${email}`); // Debug log

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log(`No user found for email: ${email}`); // Debug log
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expireOtp = new Date(Date.now() + 1 * 60 * 1000);

        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD
            }
        })

        const mailInfo = {
            from:process.env.NODEMAILER_EMAIL,
            to:email.toLowerCase(),
            subject:'RawGains Signup OTP',
            text: `Your OTP for signup is ${otp}. It expires in 1 minute.`
        }

        try{
            await transporter.sendMail(mailInfo)
            console.log(`Resend OTP to ${email.toLowerCase()}:${otp} `);
            
        }catch(error){
            return res.status(500).json({success:false,message:'Server error'})
        }



        user.otp = otp;
        user.expireOtp = expireOtp;
        await user.save();

        console.log(`Resend OTP for ${email}: ${otp}`);
        return res.status(200).json({ success: true, message: 'OTP resent successfully' });
    } catch (error) {
        console.error('Resend OTP error:', error); // Debug log
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};



const loadHomePage = async (req, res) => {
    try {
        
        const products = await Product.find({ stock: { $gt: 0 } }).limit(6); // Fetch up to 6 in-stock products
        res.render('home', { user: req.session.user,products });

       
    } catch (error) {
        console.error('Load homepage error:', error); // Debug log
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const loadLoginPage = async(req,res)=>{
    try{

        res.render('login',{user:req.session.user || null})
    }catch(error){
        return res.status(500).json({success:false,message:'Server error'})
    }
}

const loginController = async(req,res)=>{
    try{
        const {email,password} = req.body

        const user = await User.findOne({email:email.toLowerCase()})

        if(!user){
            return res.status(400).json({success:false,message:'User not exist with this email'})
        }

        if(user.isAdmin || user.role == 'admin'){
            return res.status(400).json({success:false,message:'admin cant login'})
        }

        if(!user.isVerified){
            return res.status(400).json({success:false,message:'User not verified'})
        }

        if(user.isBlocked){
            return res.status(400).json({success:false,message:'User blocked by admin'})
        }

        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({success:false,message:'User password invalid'})
        }

        req.session.user = {
            _id:user._id,
            username:user.username,
            email:user.email
        }

        return res.status(200).json({success:true,message:'User login successfully',redirect:'/home' })
    }catch(error){
        return res.status(500).json({success:false,message:'Server error'})
    }
}



const loadForgotPasswordPage = async(req,res)=>{
    try{
        res.render('forgot-password',{user:req.session.user || null})
    }catch(error){
        return res.status(500).josn({success:false,message:'Server error'})
    }
}

const forgotPasswordController = async(req,res)=>{
    try{
        const {email} = req.body

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if(!email || !emailRegex.test(email)){
            return res.status(400).json({error:'Email is required & Email must be valid'})
        }

        const user = await User.findOne({email:email.toLowerCase()})

        if(!user){
            return res.status(400).json({success:false,message:'User not found'})
        }
        if(!user.isVerified){
            return res.status(400).json({success:false,message:'User not verified'})
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expireOtp = new Date(Date.now() + 1 * 60 * 1000)

        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD
            }
        })

        const mailInfo ={
            from:process.env.NODEMAILER_EMAIL,
            to:email.toLowerCase(),
            subject:'RawGains Password Reset OTP',
            text:`Your password Reset OTP is ${otp}. It Expires in 1 minute`
        }

        await transporter.sendMail(mailInfo)

        req.session.resetEmail = email.toLowerCase()



        user.otp = otp
        user.expireOtp = expireOtp
        await user.save()

        console.log(`Reset OTP sent for ${email}: ${otp}`); 

        return res.status(200).json({success:true,message:'User reset otp send successfully',redirect:`/forgotPassword-otp`})
    }catch(error){
        return res.status(500).json({success:false,message:'Server error'})
    }
}

const loadForgotPasswordOtpPage = async(req,res)=>{
    try{

        if(!req.session.resetEmail){
            return res.redirect('/forgot-password')
        }
        res.render('forgotPassword-otp')

    }catch(error){
        return res.status(500).json({success:false,message:'Server error'})
    }
}


const forgotPasswordOtpController = async (req, res) => {
    try {
        const { otp } = req.body;
        const email = req.session.resetEmail;

        console.log(`OTP verification attempt: email=${email}, otp=${otp}`); // Debug log

        if (!email) {
            console.log('No resetEmail in session'); // Debug log
            return res.status(400).json({ success: false, message: 'Session expired. Please request a new OTP' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log(`No user found for email: ${email}`); // Debug log
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        if (user.otp !== otp || user.expireOtp < new Date()) {
            console.log(`Invalid or expired OTP for email: ${email}`); // Debug log
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        req.session.otpVerified = true; // Mark OTP as verified
        await User.updateOne(
            { email: email.toLowerCase() },
            { $set: { otp: null, expireOtp: null } }
        );

        console.log(`OTP verified for ${email}`); // Debug log
        return res.status(200).json({ success: true, message: 'OTP verified successfully', redirect: '/reset-password' });
    } catch (error) {
        console.error('Verify OTP error:', error); // Detailed error log
        return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};

const forgotPasswordResendOtpController = async(req,res)=>{
    try{
        const email = req.session.resetEmail

        if(!email){
            return res.status(500).json({success:false,message:'Session expired, please request a new OTP'})

        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expireOtp = new Date(Date.now() + 1 * 60 * 1000)

        console.log(`Generate OTP for ${email.toLowerCase()}:${otp}`);

        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD
            }
        })

        const emailInfo = {
            from:process.env.NODEMAILER_EMAIL,
            to:email.toLowerCase(),
            subject:'Resend OTP for reset password',
            text:`Your OTP for reset password is ${otp}.It expires in 1 minute `
        }

        try{
            await transporter.sendMail(emailInfo)
            console.log(`Reset password OTP for ${email.toLowerCase()}:${otp}`);
            
        }catch(error){
            return res.status(500).json({success:false,message:'Server error'})
        }

        const user = await User.findOne({email:email.toLowerCase()})

        if(!user){
            return res.status(400).json({success:false,message:'User not found'})
        }
        
        await User.updateOne({email:email.toLowerCase()},{$set:{otp,expireOtp}})
        return res.status(200).json({success:true,message:'OTP resend successfully'})

    }catch(error){
        return res.status(500).json({success:false,message:'Serverr error'})
    }
}


const loadResetPasswordPage = async (req, res) => {
    try {
        if (!req.session.resetEmail || !req.session.otpVerified) {
            console.log('Missing resetEmail or otpVerified, redirecting to /verify-otp'); // Debug log
            return res.redirect('/verify-otp');
        }
        res.render('reset-password', { email: req.session.resetEmail, user: req.session.user || null });
    } catch (error) {
        console.error('Load reset password error:', error); // Detailed error log
        return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};

const resetPasswordController = async (req, res) => {
    try {
        const email = req.session.resetEmail;

        console.log(`Reset password attempt: email=${email}`); // Debug log

        if (!email || !req.session.otpVerified) {
            console.log('Missing resetEmail or otpVerified'); // Debug log
            return res.status(400).json({ success: false, message: 'Session expired or OTP not verified' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log(`No user found for email: ${email}`); // Debug log
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        await User.updateOne(
            { email: email.toLowerCase() },
            { $set: { password: req.hashedPasssword, otp: null, expireOtp: null } } // Fixed typo
        );

        delete req.session.resetEmail;
        delete req.session.otpVerified;

        console.log(`Password reset for ${email}`); // Debug log
        return res.status(200).json({ success: true, message: 'Password reset successfully', redirect: '/login' });
    } catch (error) {
        console.error('Reset password error:', error); // Detailed error log
        return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};

const logoutController = async(req,res)=>{
    delete req.session.user
    res.redirect('/login')
}




module.exports = { 
    signupController,
    loadSignupPage,
    loadSignupOtpPage,
    signupOtpController,
    signupResendOtpController,
    loadHomePage,
    loadLoginPage,
    loginController,
    logoutController,
    loadForgotPasswordPage,
    forgotPasswordController,
    loadForgotPasswordOtpPage,
    forgotPasswordOtpController,
    forgotPasswordResendOtpController,
    loadResetPasswordPage,
    resetPasswordController
};


