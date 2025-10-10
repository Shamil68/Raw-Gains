const User = require('../../models/userSchema')
const bcrypt = require('bcrypt')
const StatusCodes = require('../../utils/statusCodes');


const loadAdminLogin = async(req,res)=>{
    try{    
        res.status(StatusCodes.OK).render('admin-login',{user:req.session.admin || null})
    }catch(error){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
    }
}



const adminLoginController = async(req,res)=>{
    try{
        const {email,password} = req.body

        const user = await User.findOne({email:email.toLowerCase()})

        if(!user){
            return res.status(StatusCodes.BAD_REQUEST).json({success:false,message:'User not found'})
        }
        if(!user.isAdmin){
            return res.status(StatusCodes.BAD_REQUEST).json({success:false,message:'Not an admin account'})
        }      
        if(!user.isVerified){
            return res.status(StatusCodes.BAD_REQUEST).json({success:false,message:'User not verified'})
        }
        

        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(StatusCodes.BAD_REQUEST).json({success:false,message:'Invalid Password'})
        }
        req.session.admin ={
            id:user._id,
            username:user.username,
            email:user.email
        }

        return res.status(StatusCodes.OK).json({success:true,message:'Admin login successfull', redirect:'/admin/dashboard'})
    }catch(error){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:'Server error'})
    }
}



const loadDashboard = async(req, res) => {
    const menuItems = [
        { text: "Dashboard", link: "/dashboard", icon: "icon-home" },
        { text: "Customers", link: "/customers", icon: "icon-user" },
        { text: "Products", link: "/products", icon: "icon-box" },
        // { text: "add-Product", link:"/add-product", icon: "icon-"}
        
    ];

    res.render("dashboard", {
        menuItems,
        activePage: "dashboard" // <-- this is used in header.ejs
    });
};



const adminLogout = async(req, res) => {
    delete req.session.admin;
    res.redirect('/admin/admin-login');
};



    


module.exports ={
    loadAdminLogin,
    adminLoginController,
    loadDashboard,  
    adminLogout
}