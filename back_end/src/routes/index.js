const AuthRouter = require('./auth/auth-routes');
const AdminProductRouter = require('./admin/product-routes');
const AdminContactRouter = require('./admin/contact-routes');
const AdminOrderRouter = require('./admin/order-routes');
const AdminUserRouter = require('./admin/user-routes');
const ShoppingProductRouter = require('./shop/product-routes');
const ShoppingCartRouter = require('./shop/cart-routes');
const ShoppingAddressRouter = require('./shop/address-routes');
const ShoppingOrderRouter = require('./shop/order-routes');
const ShoppingSearchRouter = require('./shop/search-routes');
const ShoppingReviewRouter = require('./shop/review-routes');
const ShoppingContactRouter = require('./shop/contact-routes');
const AdminPostRouter = require('./admin/post-routes');
const ShoppingBlogCategoryRouter = require('./shop/blogcategory-routes');
const ShoppingPostRouter = require('./shop/post-routes');
const CommonCategoryRouter = require('./common/category-routes');
const {
    checkRoleAdmin,
    checkRoleUser,
    checkRoleClient
} = require('../middlewares/checkRole');
function routes(app) {
    app.use('/api/auth', AuthRouter);
    app.use('/api/admin/products', checkRoleAdmin, AdminProductRouter);
    app.use('/api/admin/contact', checkRoleAdmin, AdminContactRouter);
    app.use('/api/admin/orders', checkRoleAdmin, AdminOrderRouter);
    app.use('/api/admin/users', checkRoleAdmin, AdminUserRouter);
    app.use('/api/admin/posts', checkRoleAdmin, AdminPostRouter);
    app.use('/api/shop/products', checkRoleClient, ShoppingProductRouter);
    app.use('/api/shop/cart', checkRoleClient, ShoppingCartRouter);
    app.use('/api/shop/address', checkRoleClient, ShoppingAddressRouter);
    app.use('/api/shop/order', checkRoleClient, ShoppingOrderRouter);
    app.use('/api/shop/search', checkRoleClient, ShoppingSearchRouter);
    app.use('/api/shop/review', checkRoleClient, ShoppingReviewRouter);
    app.use('/api/shop/contact', checkRoleClient, ShoppingContactRouter);
    app.use(
        '/api/shop/blogcategory',
        checkRoleClient,
        ShoppingBlogCategoryRouter
    );
    app.use('/api/shop/post', checkRoleClient, ShoppingPostRouter);
    app.use('/api/common/category', checkRoleUser, CommonCategoryRouter);
}
module.exports = routes;
