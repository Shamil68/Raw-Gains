const User = require('../../models/userSchema');
const Product = require('../../models/productSchema')
const Category = require('../../models/categorySchema');
const statusCodes = require('../../utils/statusCodes');


const loadHomePage = async (req, res) => {
    try {
        
        let products = await Product.find({ status:'Active'})
        .populate({path:'category',select:'name isListed'})
        .sort({createdAt:-1})
        .limit(4);

         products = products.map(p => {
            if (!p.category || !p.category.isListed) {
                return { ...p.toObject(), category: { name: "Uncategorized" } };
            }
            return p.toObject();
        });

        res.render('home',{
            products,
            user: req.session.user });

       
    } catch (error) {
        console.error('Load homepage error:', error); // Debug log
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
    }
};


const loadShopPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 2; // Products per page
        const skip = (page - 1) * limit;

        let query = { status: 'Active' };

        // Search
        if (req.query.search) {
            query.$or = [
                { productName: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Category filter
        if (req.query.category) {
            query.category = req.query.category;
        }

        // Price range filter
        let minPrice = parseFloat(req.query.minPrice);
        let maxPrice = parseFloat(req.query.maxPrice);

        if (!isNaN(minPrice) && !isNaN(maxPrice)) {
            query.salePrice = { $gte: minPrice, $lte: maxPrice };
        } else if (!isNaN(minPrice)) {
            query.salePrice = { $gte: minPrice };
        } else if (!isNaN(maxPrice)) {
            query.salePrice = { $lte: maxPrice };
        }

        // Sorting
        let sortOption = req.query.sort || 'relevance';
        let sort = {};
        switch (sortOption) {
            case 'price-low':
                sort.salePrice = 1;
                break;
            case 'price-high':
                sort.salePrice = -1;
                break;
            case 'a-z':
                sort.productName = 1;
                break;
            case 'z-a':
                sort.productName = -1;
                break;
            case 'newest':
                sort.createdAt = -1;
                break;
            default:
                sort.createdAt = -1;
        }

        const totalProducts = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('category');

        const categories = await Category.find({});

        res.render('shop', {
            products,
            categories,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts,
            limit,
            searchQuery: req.query.search || '',
            category: req.query.category || '',
            minPrice: req.query.minPrice || '',
            maxPrice: req.query.maxPrice || '',
            sortOption
        });
    } catch (error) {
        console.error(error);
        res.status(statusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
    }
};



const loadProductDetails = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findOne({ _id: productId, status: 'Active' })
            .populate({path:'category',match:{isListed:true},select:'name'})
            .lean();

        if (!product || product.quantity <= 0) {
            return res.redirect('shop');
        }

        if (!product.category) {
            product.category = { name: "Uncategorized" };
        }

        // Calculate average rating
        const averageRating = product.reviews && product.reviews.length > 0
            ? (product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(1)
            : 0;

        // Fetch related products (same category, exclude current product, limit to 4)
        let relatedProducts = []
        if (product.category && product.category.name !== "Uncategorized") {

         relatedProducts = await Product.find({
            _id: { $ne: productId },
            category: product.category._id,
            status: 'Active',
            // isBlocked: false,
            quantity: { $gt: 0 }
        })
            .select('productName productImage salePrice')
            .limit(4)
            .lean();
    }
        res.render('product-details', {
            product,
            averageRating,
            products:relatedProducts,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error loading product details:', error);
        return res.redirect('/shop'); // Redirect on error or unavailable product
    }
};

module.exports = {
    loadHomePage,
    loadShopPage,
    loadProductDetails

}