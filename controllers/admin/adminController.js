const User = require('../../models/userSchema')
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