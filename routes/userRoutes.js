const express = require('express');
const router = express.Router();
const passport = require('passport')
const {signupMiddleware, loginMiddleware, allowOnlyLoggedIn, preventAuthForLoggedUsers, forgotPasswordMiddleware, resetPasswordMiddleware, checkBlockUser} = require('../middlewares/userValidation');
const { signupController, signupOtpController, signupResendOtpController, loadSignupPage, loadSignupOtpPage, loadLoginPage, loginController, logoutController, loadForgotPasswordPage, forgotPasswordController, loadResetPasswordPage, resetPasswordController, loadForgotPasswordOtpPage, forgotPasswordOtpController,forgotPasswordResendOtpController } = require('../controllers/user/userAuthController');
const {loadHomePage,loadShopPage,loadProductDetails} = require('../controllers/user/userController');
const statusCodes = require('../utils/statusCodes');


router.post('/signup', signupMiddleware, signupController);
router.post('/verify-otp', signupOtpController);
router.post('/resend-otp', signupResendOtpController);
router.post('/login',loginMiddleware,loginController)
router.post('/forgot-password',forgotPasswordMiddleware,forgotPasswordController)
router.post('/forgotPassword-otp',forgotPasswordOtpController)
router.post('/forgotPasswordResend-otp', forgotPasswordResendOtpController)
router.post('/reset-password',resetPasswordMiddleware,resetPasswordController)
// router.post('/checkBlockedUser',checkBlockUser)


router.get('/otp',preventAuthForLoggedUsers,loadSignupOtpPage)
router.get('/signup',preventAuthForLoggedUsers,loadSignupPage)
router.get('/home',allowOnlyLoggedIn,loadHomePage)
router.get('/login',preventAuthForLoggedUsers,loadLoginPage)
router.get('/logout',logoutController);
router.get('/',allowOnlyLoggedIn,loadHomePage)
router.get('/shop',allowOnlyLoggedIn,loadShopPage)
router.get('/product-details/:id',allowOnlyLoggedIn,loadProductDetails)
router.get('/forgot-password',preventAuthForLoggedUsers,loadForgotPasswordPage)
router.get('/forgotPassword-otp',preventAuthForLoggedUsers,loadForgotPasswordOtpPage)
router.get('/reset-password',preventAuthForLoggedUsers,loadResetPasswordPage)


// Start Google login process
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback route after login
router.get('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err) {
      console.error("Google Auth Error:", err);
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).send("Server error: " + err.message);
    }
    if (!user) {
      return res.redirect('/login');
    }
    
     // Log the user in and create session
    req.logIn(user, (err) => {
      if (err) {
        console.error("Login Error:", err);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).send("Login error: " + err.message);
      }

      // Store user info in session
      req.session.user = user;
      return res.redirect('http://localhost:3000'); // Successful login
    });
  })(req, res, next);
});



module.exports = router;

  