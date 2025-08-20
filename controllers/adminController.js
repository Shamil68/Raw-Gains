const User = require('../models/userSchema')
const bcrypt = require('bcrypt')


const loadAdminLogin = async(req,res)=>{
    try{
        res.render('admin-login',{user:req.session.admin || null})
    }catch(error){
        return res.status(500).json({success:false,message:'Server error'})
    }
}

const adminLoginController = async(req,res)=>{
    try{
        const {email,password} = req.body

        const user = await User.findOne({email:email.toLowerCase()})

        if(!user){
            return res.status(400).json({success:false,message:'User not found'})
        }
        if(!user.isAdmin){
            return res.status(400).json({success:false,message:'Not an admin account'})
        }      
        if(!user.isVerified){
            return res.status(400).json({success:false,message:'User not verified'})
        }
        

        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({success:false,message:'Invalid Password'})
        }

        req.session.admin ={
            id:user._id,
            username:user.username,
            email:user.email
        }

        return res.status(200).json({success:true,message:'Admin login successfull', redirect:'/admin/dashboard'})
    }catch(error){
        return res.status(500).json({success:false,message:'Server error'})
    }
}


const loadDashboard = async(req, res) => {
    const menuItems = [
        { text: "Dashboard", link: "/dashboard", icon: "icon-home" },
        { text: "Customers", link: "/customers", icon: "icon-user" },
        { text: "Products", link: "/products", icon: "icon-box" }
    ];

    res.render("dashboard", {
        menuItems,
        currentPage: "dashboard" // <-- this is used in header.ejs
    });
};


const customerController = async(req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1
        const limit = 4
        const skip = (page - 1) * limit
        const query = req.query.search || ''
    

    const filter = query ? {
        $or:[
            {username:{$regex:query,$options:'i'}},
            {email:{$regex:query,$options:'i'}}
        ],
        isAdmin:false
    }:{isAdmin:false};

    const users = await User.find(filter).sort({createdAt:-1}).skip(skip).limit(limit)
    const totalUsers = await User.countDocuments(filter)
    const totalPages = Math.ceil(totalUsers/limit)

    res.render('customers',{
        admin:req.session.admin,
        users,
        currentPage:page,
        totalPages,
        search:query,
        currentPage:'customers'
    })

}catch(error){
    return res.status(500).json({success:false,message:'Server error'})
}

}

const blockCustomer = async(req,res)=>{
    try{
        const {id} = req.body

        const user = await User.findById(id)
        if(!user){
            return res.status(400).json({success:false,message:'User not found'})
        }
        await User.updateOne({_id:id},{$set:{isBlocked:true}})
        return res.status(200).json({success:true,message:'User has been blocked'})
    }catch(error){
        return res.status(500).json({success:false,message:'Server error'})
    }
}

const unblockCustomer = async(req,res)=>{
    try{
        const {id} = req.body

        const user = await User.findById(id)
        if(!user){
            return res.status(400).json({success:false,message:'User not found'})
        }
        await User.updateOne({_id:id},{$set:{isBlocked:false}})
        return res.status(200).json({success:true,message:'User has been unblocked'})

    }catch(error){
        return res.status(500).json({success:false,message:'Server error'})
    }
}

    
const adminLogout = async(req, res) => {
    delete req.session.admin;
    res.redirect('/admin/admin-login');
};



module.exports ={
    loadAdminLogin,
    adminLoginController,
    loadDashboard,
    customerController,
    blockCustomer,
    unblockCustomer,
    adminLogout
}