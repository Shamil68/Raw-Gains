const express = require('express');
const router = express.Router();
const passport = require('passport')
const {signupMiddleware, loginMiddleware, allowOnlyLoggedIn, preventAuthForLoggedUsers, forgotPasswordMiddleware, resetPasswordMiddleware, checkBlockUser} = require('../middlewares/userValidation');
const {signupController, signupOtpController, signupResendOtpController, loadSignupPage, loadSignupOtpPage, loadLoginPage, loginController, logoutController, loadForgotPasswordPage, forgotPasswordController, loadResetPasswordPage, resetPasswordController, loadForgotPasswordOtpPage, forgotPasswordOtpController,forgotPasswordResendOtpController } = require('../controllers/user/userAuthController');
const {loadHomePage,loadShopPage,loadProductDetails} = require('../controllers/user/userController');
const {loadProfile, loadVerifyEmailPage, loadUpdatePasswordPage, verifyEmailController, updatePasswordController, loadUpdateEmailOtp, updateEmailOtpController, loadUpdateEmail, updateEmailResendOtpController, updateEmailController, updateProfilePicture, loadEditProfile, editProfileController} = require('../controllers/user/profileController')
const statusCodes = require('../utils/statusCodes');
const { uploadProfilePicture } = require('../helpers/multer');
const { loadAddressPage, loadAddAddress, addAddresscontroller, deleteAddress, loadEditAddress, updateAddressController } = require('../controllers/user/addressController');



router.post('/signup', signupMiddleware, signupController);
router.post('/verify-otp', signupOtpController);
router.post('/resend-otp', signupResendOtpController);
router.post('/login',loginMiddleware,loginController)
router.post('/forgot-password',forgotPasswordMiddleware,forgotPasswordController)
router.post('/forgotPassword-otp',forgotPasswordOtpController)
router.post('/forgotPasswordResend-otp', forgotPasswordResendOtpController)
router.post('/reset-password',resetPasswordMiddleware,resetPasswordController)
router.post('/verify-email',verifyEmailController)
router.post('/update-email-otp',updateEmailOtpController)
router.post('/updateEmail-ResendOtp',updateEmailResendOtpController)
router.post('/update-email',updateEmailController)
router.patch('/update-password', updatePasswordController)
router.post('/update-profile-picture',uploadProfilePicture,updateProfilePicture)
router.post('/edit-profile',editProfileController)
router.post('/add-address',addAddresscontroller)
router.delete('/delete-address/:id',deleteAddress)
router.post('/edit-address/:id',updateAddressController)



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
router.get('/profile',allowOnlyLoggedIn,loadProfile)
router.get('/change-email',allowOnlyLoggedIn,loadVerifyEmailPage)
router.get('/change-password',allowOnlyLoggedIn,loadUpdatePasswordPage)
router.get('/update-email-otp',allowOnlyLoggedIn,loadUpdateEmailOtp)
router.get('/update-email',allowOnlyLoggedIn,loadUpdateEmail)
router.get('/edit-profile',allowOnlyLoggedIn,loadEditProfile)
router.get('/addresses',allowOnlyLoggedIn,loadAddressPage)
router.get('/add-address',allowOnlyLoggedIn,loadAddAddress)
router.get('/edit-address/:id',allowOnlyLoggedIn,loadEditAddress)


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

  