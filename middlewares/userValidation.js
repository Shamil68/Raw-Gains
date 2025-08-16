const bcrypt = require('bcryptjs');
const User = require('../models/userSchema');

const signupMiddleware = async (req, res, next) => {
    try {
        const { username, email, phone, password, confirmPassword } = req.body;

        console.log(`Validating signup: username=${username}, email=${email}, phone=${phone}`); // Debug log

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10}$/;

        if (!username || username.length < 3) {
            return res.status(400).json({ error: 'Username required & must be at least 3 characters' });
        }

        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({ error: 'Email must be valid' });
        }

        if (!phone || !phoneRegex.test(phone)) {
            return res.status(400).json({ error: 'Phone is required & must be valid' });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Password required & must be at least 6 characters' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        req.hashedPassword = hashedPassword;
        req.userData = { username, email: email.toLowerCase(), phone };

        next();
    } catch (error) {
        // console.error('Signup middleware error:', error); // Debug log
        return res.status(500).json({ error: 'Server error' });
    }
};

const loginMiddleware = async(req,res,next)=>{
    try{
        const {email,password} = req.body

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!email || !emailRegex.test(email)){
            return res.status(400).json({error:'Email is required & Email must be valid'})

        }

        if(!password){
            return res.status(400).json({error:'Password is required'})
        }
        next()

    }catch(error){
        return res.status(500).json({error:'Server error'})
    }

}

const forgotPasswordMiddleware = async(req,res,next)=>{
    try{
        const {email} = req.body

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if(!email || !emailRegex.test(email)){
            return res.status(400).json({error:'Email required & it must be valid'})
        }
        next()

    }catch(error){
        return res.status(500).json({error:'Server error'})
    }
}

const resetPasswordMiddleware = async(req,res,next)=>{
    try{
        const {password,confirmPassword} = req.body

        if(!password || password.length <6){
            return res.status(400).json({error:'Password is required & must be at least 6 characters'})
        }
        if(password !== confirmPassword){
            return res.status(400).json({error:'Passwords do not match'})
        }

        const hashedPasssword = await bcrypt.hash(password,10)
        req.hashedPasssword = hashedPasssword

        next()

    }catch(error){
        return res.status(500).json({error:'Server error'})
    }
}


// For pages like /login, /signup: prevent logged-in users
const preventAuthForLoggedUsers = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/home');
  }
  next();
};

// For pages like /home: allow only logged-in users
const allowOnlyLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};






module.exports = {
    signupMiddleware,
    loginMiddleware,
    forgotPasswordMiddleware,
    resetPasswordMiddleware,
    allowOnlyLoggedIn,
    preventAuthForLoggedUsers}


