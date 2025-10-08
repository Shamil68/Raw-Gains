const bcrypt = require('bcryptjs');
const User = require('../models/userSchema');
const statusCodes = require('../utils/statusCodes');

const signupMiddleware = async (req, res, next) => {
    try {
        const { username, email, phone, password, confirmPassword } = req.body;

        console.log(`Validating signup: username=${username}, email=${email}, phone=${phone}`); // Debug log

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10}$/;

        if (!username || username.length < 3) {
            return res.status(statusCodes.BAD_REQUEST).json({ error: 'Username required & must be at least 3 characters' });
        }

        if (!email || !emailRegex.test(email)) {
            return res.status(statusCodes.BAD_REQUEST).json({ error: 'Email must be valid' });
        }

        if (!phone || !phoneRegex.test(phone)) {
            return res.status(statusCodes.BAD_REQUEST).json({ error: 'Phone is required & must be valid' });
        }

        if (!password || password.length < 6) {
            return res.status(statusCodes.BAD_REQUEST).json({ error: 'Password required & must be at least 6 characters' });
        }

        if (password !== confirmPassword) {
            return res.status(statusCodes.BAD_REQUEST).json({ error: 'Passwords do not match' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        req.hashedPassword = hashedPassword;
        req.userData = { username, email: email.toLowerCase(), phone };

        next();
    } catch (error) {
        // console.error('Signup middleware error:', error); // Debug log
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Server error' });
    }
};

const loginMiddleware = async(req,res,next)=>{
    try{
        const {email,password} = req.body

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!email || !emailRegex.test(email)){
            return res.status(statusCodes.BAD_REQUEST).json({error:'Email is required & Email must be valid'})

        }

        if(!password){
            return res.status(statusCodes.BAD_REQUEST).json({error:'Password is required'})
        }
        next()

    }catch(error){
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({error:'Server error'})
    }

}

const forgotPasswordMiddleware = async(req,res,next)=>{
    try{
        const {email} = req.body

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!email || !emailRegex.test(email)){
            return res.status(statusCodes.BAD_REQUEST).json({error:'Email required & it must be valid'})
        }
        next()

    }catch(error){
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({error:'Server error'})
    }
}

const resetPasswordMiddleware = async(req,res,next)=>{
    try{
        const {password,confirmPassword} = req.body

        if(!password || password.length <6){
            return res.status(statusCodes.BAD_REQUEST).json({error:'Password is required & must be at least 6 characters'})
        }
        if(password !== confirmPassword){
            return res.status(statusCodes.BAD_REQUEST).json({error:'Passwords do not match'})
        }

        const hashedPasssword = await bcrypt.hash(password,10)
        req.hashedPasssword = hashedPasssword

        next()

    }catch(error){
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({error:'Server error'})
    }
}

const checkBlockUser = async(req,res,next)=>{

    if(req.session.user){
        try{
            const user = await User.findById(req.session.user._id)
            if(user && user.isBlocked){

                delete req.session.user
                req.session.blockedMessage = 'Your account has been blocked'
                return res.redirect('/login')
            }
        }catch(error){
            return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
        }
    }
    next()
}


// Prevent already logged-in users from accessing login/signup
const preventAuthForLoggedUsers = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/home');
  }
  next();
};



// Allow only logged-in users for pages like /home
const allowOnlyLoggedIn = async(req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const user = await User.findById(req.session.user._id)

  if(!user || user.isBlocked){
    delete req.session.user
        return res.redirect('/login')

    
  }
  next()

};






module.exports = {
    signupMiddleware,
    loginMiddleware,
    forgotPasswordMiddleware,
    resetPasswordMiddleware,
    allowOnlyLoggedIn,
    preventAuthForLoggedUsers,
    checkBlockUser
}


