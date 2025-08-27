const Product = require('../../models/productSchema')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const loadAddProduct = async(req,res)=>{
    try{
        res.render('add-product',{
            admin:req.session.admin,
            currentPage:'add-product'
        })

    }catch(error){
        return res.status(500).json({success:false,message:'Server error'})
    }

}

const addProductController = async(req,res)=>{
    try{
        const {productName,description,regularPrice,salePrice,quantity,} = req.body
        const images = req.files
    

    if(images.length <3){
        return res.status(400).json({success:false,message:'Minimum 3 images required'})
    
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


    // const productImages = await Promise.all(images.map(async (image)=>{
    //     const resized = await sharp(image.path)
    //     .resize(500,500,{fit:'cover'})
    //     .toFormat('jpeg')
    //     .jpeg({quality:80})
    //     .toFile(`public/uploads/${image.filename}`)
    //     return `/uploads/${image.filename}`
        
    // }))

    const newProduct = new Product({
        productName,
        description,
        regularPrice:parseFloat(regularPrice),
        salePrice:parseFloat(salePrice),
        quantity:parseInt(quantity),
        images:productImages

    })

    await newProduct.save()
    return res.status(200).json({success:true,message:'New product added successfully',redirect:'/admin/products'})

}catch(error){
        console.error("ERROR IN ADD PRODUCT:", error);

    return res.status(500).json({success:false,message:'Server error'})
}
}

module.exports={
    loadAddProduct,
    addProductController
}
