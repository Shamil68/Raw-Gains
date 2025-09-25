const express = require('express')
const router = express.Router()
const {adminLoginMiddleware,preventAuthForLoggedUsers,allowOnlyLoggedInAdmin }= require('../middlewares/adminValidation')
const {adminLoginController,loadAdminLogin,adminLogout,loadDashboard,} = require('../controllers/admin/adminController')
const{customerController,blockCustomer,unblockCustomer} = require('../controllers/admin/customerController')
const { addProductController, productController, blockProduct, unblockProduct, loadEditProduct, deleteProductImageController, updateProductController } = require('../controllers/admin/productController')
const handleMultipleUploads = require('../helpers/multer')
const { addCategoryController, categoryController, deleteCategoryController, updateCategoryController, loadEditCategory } = require('../controllers/admin/categoryController')
// const upload = multer()


router.post('/admin-login',adminLoginMiddleware,adminLoginController) 


router.post('/blockCustomer',allowOnlyLoggedInAdmin,blockCustomer)
router.post('/unblockCustomer',allowOnlyLoggedInAdmin,unblockCustomer)


router.post('/add-product', handleMultipleUploads ,addProductController)
router.patch('/block-products/:id',blockProduct)
router.patch('/unblock-products/:id',unblockProduct)
// router.delete('/delete-product/:id',deleteProductController)
router.post('/delete-product-image/:id', deleteProductImageController)
router.patch('/edit-product/:id',handleMultipleUploads,updateProductController)


router.post('/add-category',addCategoryController)
router.post('/set-category/:id',deleteCategoryController)
router.patch('/edit-category/:id',updateCategoryController)


router.get('/admin-login',preventAuthForLoggedUsers,loadAdminLogin)
router.get('/dashboard',allowOnlyLoggedInAdmin,loadDashboard)
router.get('/customers',allowOnlyLoggedInAdmin,customerController)
// router.get('/add-product',allowOnlyLoggedInAdmin,loadAddProduct)
router.get('/products',allowOnlyLoggedInAdmin,productController)
router.get('/edit-product/:id',allowOnlyLoggedInAdmin,loadEditProduct)
// router.get('/add-category',allowOnlyLoggedInAdmin,loadAddCategory)
router.get('/categories',allowOnlyLoggedInAdmin,categoryController)
router.get('/edit-category/:id',allowOnlyLoggedInAdmin,loadEditCategory)
router.get('/logout',adminLogout)




module.exports = router