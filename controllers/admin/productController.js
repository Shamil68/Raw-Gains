const Product = require('../../models/productSchema')
const Category = require('../../models/categorySchema');
const sharp = require('sharp')
const path = require('path')
const fs = require('fs');
const statusCodes = require('../../utils/statusCodes');


const loadAddProduct = async(req,res)=>{
    try{
        const categories = await Category.find({ isListed: true }).sort({ createdAt: -1 });
        res.render('products',{
            admin:req.session.admin,
            activePage:'products',
            categories
        })

    }catch(error){
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
    }

}



const addProductController = async(req,res)=>{
    try{
        const {productName,description,regularPrice,salePrice,quantity,category} = req.body
        const images = req.files
    

    if(images.length <3){
        return res.status(statusCodes.BAD_REQUEST).json({success:false,message:'Minimum 3 images required'})
    
    }

    const selectedCategory = await Category.findOne({ _id: category});
        if (!selectedCategory) {
            return res.status(statusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid category selected' });
        }

    const uploadDir = path.join(__dirname, "../../public/uploads/resized");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    
    // Process images with sharp
    const productImages = await Promise.all(
      images.map(async (image) => {
        const newFilename = Date.now() + "-" + image.originalname.replace(/\s+/g, "_");
        const outputPath = path.join("public", "uploads", "resized", newFilename);

        await sharp(image.path)
          .resize(500, 500, { fit: "cover" })
          .jpeg({ quality: 80 })
          .toFile(outputPath);

        return "/uploads/resized/" + newFilename;
      })
    );

    const newProduct = new Product({
        productName,
        description,
        regularPrice:parseFloat(regularPrice),
        salePrice:parseFloat(salePrice),
        quantity:parseInt(quantity),
        productImage:productImages,
        category

    })

    await newProduct.save()
    return res.status(statusCodes.OK).json({success:true,message:'New product added successfully',redirect:'/admin/products'})

}catch(error){
console.error("ERROR IN ADD PRODUCT:", error)

return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
}
}



const productController = async(req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1
        const limit = 3
        const searchQuery = req.query.search || ''
        const query = searchQuery 
        ? {productName:{$regex:searchQuery,$options:'i'}} 
        : {}

        const products = await Product.find(query)
        .populate({path:'category',select:'name isListed'})  // Populate category
        .sort({createdAt:-1})
        .skip((page-1) * limit)
        .limit(limit)

        const updatedProducts = products.map(p => {
    if (!p.category || !p.category.isListed) {
        return { ...p.toObject(), category: { name: "Uncategorized" } };
    }
    return p;
});


        const totalProducts = await Product.countDocuments(query)
        const totalPages = Math.ceil(totalProducts/limit)
        const categories = await Category.find({ isListed: true }).sort({ createdAt: -1 });

        res.render('products',{
            products:updatedProducts,
            currentPage:page,
            totalPages,
            searchQuery:req.query.search || '' ,
            limit,
            activePage:'products',
            categories
        })

    }catch(error){
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
    }
}



const blockProduct = async(req,res)=>{
    try{
        const product = await Product.findByIdAndUpdate(req.params.id,{status:'Inactive'},{new:true})
        
        if(!product){
            return res.status(statusCodes.BAD_REQUEST).json({success:false,message:'Product not found'})
        }
        res.json({success:true,message:'Product has been Blocked successfully'})

    }catch(error){
        console.error('Error blocking product:', error);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
    }
}



const unblockProduct = async(req,res)=>{
    try{
        const product = await Product.findByIdAndUpdate(req.params.id,{status:'Active'},{new:true})

        if(!product){
            return res.status(statusCodes.BAD_REQUEST).json({success:false,message:'Product not found'})
        }

        res.json({success:true,message:'Product has been unblocked successfully'})

    }catch(error){
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
    }
}



const loadEditProduct = async(req,res)=>{
    try{
        const product = await Product.findById(req.params.id)
        const categories = await Category.find({ isListed: true }).sort({ createdAt: -1 });  // Fetch all active categories

        if(!product){
            return res.status(statusCodes.BAD_REQUEST).json({success:false,message:'Product not found'})

        }
        res.render('edit-product',{
            product,
            admin:req.session.admin,
            activePage:'edit-product',
            categories  // Pass categories to the view
        })

    }catch(error){
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
    }
}



const updateProductController = async (req, res) => {
  try {
    const { productName, description, regularPrice, salePrice, quantity,category, productImage, initialSlotCount } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(statusCodes.BAD_REQUEST).json({ success: false, message: 'Product not found' });
    }

    const selectedCategory = await Category.findOne({ _id: category});

    if (!selectedCategory) {
        return res.status(statusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid category selected' });
        }

    // Update main fields
    product.productName = productName || product.productName;
    product.description = description || product.description;
    product.regularPrice = parseFloat(regularPrice) || product.regularPrice;
    product.salePrice = parseFloat(salePrice) || product.salePrice;
    product.quantity = parseInt(quantity) ?? product.quantity;
    product.category = category || product.category;  // Update category

    // Parse existing images from hidden input
    let updatedImages = [];
    if (productImage) {
      try {
        updatedImages = JSON.parse(productImage);
      } catch (err) {
        updatedImages = Array.isArray(productImage) ? productImage : [productImage];
      }
    } else {
      updatedImages = product.productImage || [];
    }

    // Handle new uploaded files and resize
    const sharp = require('sharp');
    const path = require('path');
    const fs = require('fs');

    if (req.files && req.files.length > 0) {
      const uploadDir = path.join(__dirname, "../../public/uploads/resized");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const newImages = await Promise.all(req.files.map(async (file) => {
        const newFilename = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
        const outputPath = path.join(uploadDir, newFilename);

        await sharp(file.path)
          .resize(500, 500, { fit: "cover" })
          .jpeg({ quality: 80 })
          .toFile(outputPath);

        // Optionally delete original upload
        fs.unlinkSync(file.path);

        return "/uploads/resized/" + newFilename;
      }));

      updatedImages = [...updatedImages, ...newImages];
    }

    product.productImage = updatedImages;

    await product.save();

    res.status(statusCodes.OK).json({ success: true, message: "Product updated successfully" });

  } catch (error) {
    console.error("Error in updateProductController:", error);
    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server error", error: error.message });
  }
};



const deleteProductImageController = async (req, res) => {
    try {
        const { id } = req.params;
        const { image } = req.body;

        // Find product
        const product = await Product.findById(id);
        if (!product) {
            return res.status(statusCodes.BAD_REQUEST).json({ success: false, message: 'Product not found' });
        }

        // Remove image and compact array
        product.productImage = product.productImage.filter(img => img && img !== image && img.trim() !== '');
        await product.save();

        // Optionally delete physical file (if using fs)
        const fs = require('fs').promises;
        const path = require('path');
        const imagePath = path.join(__dirname, '..', 'public', image);
        try {
            await fs.unlink(imagePath);
        } catch (err) {
            console.warn(`Failed to delete file ${imagePath}: ${err.message}`);
        }

        res.json({ success: true, message: 'Image deleted successfully', product: { productImage: product.productImage } });
    } catch (error) {
        console.error(error);
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
    }
};



const deleteProductController = async (req, res) => {
    try {
        const productId = req.params.id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(statusCodes.BAD_REQUEST).json({ success: false, message: 'Product not found' });
        }

        // Remove product images from storage (if needed)
        if (product.productImage && product.productImage.length > 0) {
            product.productImage.forEach(image => {
                const fs = require('fs');
                const path = require('path');
                const imagePath = path.join(__dirname, '../public', image);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            });
        }

        await Product.findByIdAndDelete(productId);

        res.status(statusCodes.OK).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error in deleteProductController:', error);
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error', error: error.message });
    }
};






module.exports={
    loadAddProduct,
    addProductController,
    productController,
    blockProduct,
    unblockProduct,
    deleteProductController,
    loadEditProduct,
    updateProductController,
    deleteProductImageController
}
