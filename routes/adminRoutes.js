const express = require('express')
const router = express.Router()
const {adminLoginMiddleware,preventAuthForLoggedUsers,allowOnlyLoggedInAdmin }= require('../middlewares/adminValidation')
const {adminLoginController,loadAdminLogin,adminLogout,loadDashboard, customerController, blockCustomer, unblockCustomer} = require('../controllers/admin/adminController')
const { loadAddProduct, addProductController, productController, blockProduct, unblockProduct, editProductController, deleteProductController, deleteProductImageController, updateProductController } = require('../controllers/admin/productController')
const handleMultipleUploads = require('../helpers/multer')
// const upload = multer()


router.post('/admin-login',adminLoginMiddleware,adminLoginController) 
// router.post('/customers',customerController)
router.post('/blockCustomer',allowOnlyLoggedInAdmin,blockCustomer)
router.post('/unblockCustomer',allowOnlyLoggedInAdmin,unblockCustomer)
router.post('/add-product', handleMultipleUploads ,addProductController)
router.post('/block-products/:id',blockProduct)
router.post('/unblock-products/:id',unblockProduct)
router.post('/delete-product-image/:id', deleteProductImageController)
router.post('/edit-product/:id',handleMultipleUploads,updateProductController)


router.delete('/delete-product/:id',deleteProductController)


router.get('/admin-login',preventAuthForLoggedUsers,loadAdminLogin)
router.get('/dashboard',allowOnlyLoggedInAdmin,loadDashboard)
router.get('/customers',allowOnlyLoggedInAdmin,customerController)
router.get('/add-product',allowOnlyLoggedInAdmin,loadAddProduct)
router.get('/products',allowOnlyLoggedInAdmin,productController)
router.get('/edit-product/:id',allowOnlyLoggedInAdmin,editProductController)
router.get('/logout',adminLogout)




module.exports = router