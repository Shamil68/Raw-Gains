const express = require('express')
const router = express.Router()
const {adminLoginMiddleware,preventAuthForLoggedUsers,allowOnlyLoggedInAdmin }= require('../middlewares/adminValidation')
const {adminLoginController,loadAdminLogin,adminLogout,loadDashboard} = require('../controllers/adminController')


router.post('/admin-login',adminLoginMiddleware,adminLoginController)


router.get('/admin-login',preventAuthForLoggedUsers,loadAdminLogin)
router.get('/dashboard',allowOnlyLoggedInAdmin,loadDashboard)
router.get('/logout',adminLogout)



module.exports = router