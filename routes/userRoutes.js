const express = require('express');
const router = express.Router();
const {signupMiddleware, loginMiddleware, allowOnlyLoggedIn, preventAuthForLoggedUsers, forgotPasswordMiddleware, resetPasswordMiddleware, checkBlockUser} = require('../middlewares/userValidation');
const { signupController, signupOtpController, signupResendOtpController, loadSignupPage, loadSignupOtpPage, loadHomePage, loadLoginPage, loginController, logoutController, loadForgotPasswordPage, forgotPasswordController, loadResetPasswordPage, resetPasswordController, loadForgotPasswordOtpPage, forgotPasswordOtpController,forgotPasswordResendOtpController, loadShopPage, loadProductDetails } = require('../controllers/user/userController');



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


module.exports = router;

