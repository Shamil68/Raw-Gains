const express = require('express')
const router = express.Router()
const {adminLoginMiddleware,preventAuthForLoggedUsers,allowOnlyLoggedInAdmin }= require('../middlewares/adminValidation')
const {adminLoginController,loadAdminLogin,adminLogout,loadDashboard, customerController, blockCustomer, unblockCustomer} = require('../controllers/adminController')


router.post('/admin-login',adminLoginMiddleware,adminLoginController)
// router.post('/customers',customerController)
router.post('/blockCustomer',allowOnlyLoggedInAdmin,blockCustomer)
router.post('/unblockCustomer',allowOnlyLoggedInAdmin,unblockCustomer)



router.get('/admin-login',preventAuthForLoggedUsers,loadAdminLogin)
router.get('/dashboard',allowOnlyLoggedInAdmin,loadDashboard)
router.get('/customers',allowOnlyLoggedInAdmin,customerController)
router.get('/logout',adminLogout)




module.exports = router