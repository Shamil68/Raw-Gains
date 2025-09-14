const express = require('express')
const router = express.Router()
const {adminLoginMiddleware,preventAuthForLoggedUsers,allowOnlyLoggedInAdmin }= require('../middlewares/adminValidation')
const {adminLoginController,loadAdminLogin,adminLogout,loadDashboard,} = require('../controllers/admin/adminController')
const{customerController,blockCustomer,unblockCustomer} = require('../controllers/admin/customerController')
const { loadAddProduct, addProductController, productController, blockProduct, unblockProduct, loadEditProduct, deleteProductController, deleteProductImageController, updateProductController } = require('../controllers/admin/productController')
const handleMultipleUploads = require('../helpers/multer')
const { addCategoryController, loadAddCategory, categoryController, deleteCategoryController, updateCategoryController, loadEditCategory } = require('../controllers/admin/categoryController')
// const upload = multer()


router.post('/admin-login',adminLoginMiddleware,adminLoginController) 


router.patch('/blockCustomer',allowOnlyLoggedInAdmin,blockCustomer)
router.patch('/unblockCustomer',allowOnlyLoggedInAdmin,unblockCustomer)


router.post('/add-product', handleMultipleUploads ,addProductController)
router.patch('/block-products/:id',blockProduct)
router.patch('/unblock-products/:id',unblockProduct)
router.delete('/delete-product/:id',deleteProductController)
router.post('/delete-product-image/:id', deleteProductImageController)
router.patch('/edit-product/:id',handleMultipleUploads,updateProductController)


router.post('/add-category',addCategoryController)
router.delete('/delete-category/:id',deleteCategoryController)
router.patch('/edit-category/:id',updateCategoryController)


router.get('/admin-login',preventAuthForLoggedUsers,loadAdminLogin)
router.get('/dashboard',allowOnlyLoggedInAdmin,loadDashboard)
router.get('/customers',allowOnlyLoggedInAdmin,customerController)
router.get('/add-product',allowOnlyLoggedInAdmin,loadAddProduct)
router.get('/products',allowOnlyLoggedInAdmin,productController)
router.get('/edit-product/:id',allowOnlyLoggedInAdmin,loadEditProduct)
router.get('/add-category',allowOnlyLoggedInAdmin,loadAddCategory)
router.get('/categories',allowOnlyLoggedInAdmin,categoryController)
router.get('/edit-category/:id',allowOnlyLoggedInAdmin,loadEditCategory)
router.get('/logout',adminLogout)




module.exports = router