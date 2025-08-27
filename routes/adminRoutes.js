const express = require('express')
const router = express.Router()
const {adminLoginMiddleware,preventAuthForLoggedUsers,allowOnlyLoggedInAdmin }= require('../middlewares/adminValidation')
const {adminLoginController,loadAdminLogin,adminLogout,loadDashboard, customerController, blockCustomer, unblockCustomer} = require('../controllers/admin/adminController')
const { loadAddProduct, addProductController } = require('../controllers/admin/productController')
const multipleUpload = require('../helpers/multer')
// const upload = multer()

router.post('/admin-login',adminLoginMiddleware,adminLoginController) 
// router.post('/customers',customerController)
router.post('/blockCustomer',allowOnlyLoggedInAdmin,blockCustomer)
router.post('/unblockCustomer',allowOnlyLoggedInAdmin,unblockCustomer)
router.post('/add-product', multipleUpload ,addProductController)


router.get('/admin-login',preventAuthForLoggedUsers,loadAdminLogin)
router.get('/dashboard',allowOnlyLoggedInAdmin,loadDashboard)
router.get('/customers',allowOnlyLoggedInAdmin,customerController)
router.get('/add-product',loadAddProduct)
router.get('/logout',adminLogout)




module.exports = router