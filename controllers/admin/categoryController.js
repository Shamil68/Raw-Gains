const Category = require('../../models/categorySchema')



const loadAddCategory = async (req, res) => {
    try {
        res.render('categories', {
            admin: req.session.admin,
            activePage: 'add-category'
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' })
    }
}

const addCategoryController = async (req, res) => {
    try {
        const { categoryName, description } = req.body

        const existingCategory = await Category.findOne({name:categoryName,isDeleted:false})
        if(existingCategory){
            return res.status(400).json({success:false,message:'Category name already exist'})
        }

        const newCategory = new Category({
            name:categoryName,
            description
        })

        await newCategory.save()
        return res.status(200).json({success:true,message:'Category added successfully', redirect:'/admin/categories'})


    }catch(error){
        console.log('eror',error)
        return res.status(500).json({success:false,message:'Server error'})
    }
}



const categoryController = async(req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1
        const limit = 3
        const searchQuery = req.query.search || ''
        const skip = (page-1)*limit

        const query = {
            // isDeleted: false,
            name:{$regex:searchQuery,$options:'i'}
        }

        const categories = await Category.find(query)
        .sort({createdAt:-1})
        .skip(skip)
        .limit(limit)

        const totalCategories = await Category.countDocuments(query)
        const totalPages = Math.ceil(totalCategories/limit)

        res.render('categories',{
            categories,
            currentPage:page,
            totalPages,
            searchQuery,
            limit,
            activePage:'categories'
        })
    }catch(error){
        return res.status(500).json({success:false,message:'Server error'})
    }
}



const deleteCategoryController = async(req,res)=>{
    try{
        const {id} = req.params

        const category = await Category.findById(id)
        if(!category){
            return res.status(400).json({sucess:false,message:'Category not found'})
        }
    
        // if(!category.isListed){
        //     return res.status(400).json({success:false,message:'Category is already Unlisted'})
        // }

        category.isListed = !category.isListed
        await category.save()

        const status = category.isListed ? "List" : "Unlist"

        return res.status(200).json({success:true,message:`Category ${status} successfully`})

    }catch(error){
        console.error('Error deleting category:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

const loadEditCategory = async(req,res)=>{
    try{
        const {id} = req.params

        const category = await Category.findById(id)

        if(!category || !category.isListed){
            return res.status(400).json({success:false,message:'Category not found'})
        }

        res.render('edit-category',{
            category,
            admin:req.session.admin,
            activePage:'edit-category'
        })

    }catch(error){
        return res.status(500).json({success:false,message:'Server error'})
    }
}

const updateCategoryController = async(req,res)=>{
    try{
        const {id} = req.params
        const {categoryName,description} = req.body

        const category = await Category.findById(id)
        if(!category || category.isDeleted){
            return res.status(400).json({success:false,message:'Category not found'})
        }

        const existingCategory = await Category.findOne({name:categoryName,isDeleted:false,_id:{$ne:id}})

        if(existingCategory){
            return res.status(400).json({success:false,message:'Category already exist'})
        }

        category.name = categoryName,
        category.description = description

        await category.save()

        return res.status(200).json({success:true,message:'Category updated successfully',redirect:'/admin/categories'})

    }catch(error){
        return res.status(500).json({success:false,message:'Server error'})
    }
}



module.exports = {
    loadAddCategory,
    addCategoryController,
    categoryController,
    deleteCategoryController,
    loadEditCategory,
    updateCategoryController

}