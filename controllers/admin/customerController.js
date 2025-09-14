const User = require('../../models/userSchema')
const bcrypt = require('bcrypt')


const customerController = async(req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1
        const limit = 3
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
        searchQuery:query,
        activePage:'customers'
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


module.exports={
    customerController,
    blockCustomer,
    unblockCustomer,
}