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
const { checkRoleAdmin, checkRoleUser } = require('../middlewares/checkRole');
function routes(app) {
    app.use('/api/auth', AuthRouter);
    app.use('/api/admin/products', checkRoleAdmin, AdminProductRouter);
    app.use('/api/admin/contact', checkRoleAdmin, AdminContactRouter);
    app.use('/api/admin/orders', checkRoleAdmin, AdminOrderRouter);
    app.use('/api/admin/users', checkRoleAdmin, AdminUserRouter);
    app.use('/api/shop/products', checkRoleUser, ShoppingProductRouter);
    app.use('/api/shop/cart', checkRoleUser, ShoppingCartRouter);
    app.use('/api/shop/address', checkRoleUser, ShoppingAddressRouter);
    app.use('/api/shop/order', checkRoleUser, ShoppingOrderRouter);
    app.use('/api/shop/search', checkRoleUser, ShoppingSearchRouter);
    app.use('/api/shop/review', checkRoleUser, ShoppingReviewRouter);
    app.use('/api/shop/contact', checkRoleUser, ShoppingContactRouter);
}
module.exports = routes;
