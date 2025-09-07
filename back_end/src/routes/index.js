const AuthRouter = require("./auth/auth-routes");
const AdminProductRouter = require("./admin/product-routes");
const AdminContactRouter = require("./admin/contact-routes");
const AdminOrderRouter = require("./admin/order-routes");
const AdminUserRouter = require("./admin/user-routes");
const AdminHeroBannerRouter = require("./admin/heroBanner-routes");
const ShoppingProductRouter = require("./shop/product-routes");
const ShoppingCartRouter = require("./shop/cart-routes");
const ShoppingAddressRouter = require("./shop/address-routes");
const ShoppingOrderRouter = require("./shop/order-routes");
const ShoppingSearchRouter = require("./shop/search-routes");
const ShoppingReviewRouter = require("./shop/review-routes");
const ShoppingContactRouter = require("./shop/contact-routes");
const AdminPostRouter = require("./admin/post-routes");
const ShoppingBlogCategoryRouter = require("./shop/blogcategory-routes");
const ShoppingPostRouter = require("./shop/post-routes");
const ShoppingHeroBannerRouter = require("./shop/heroBanner-routes");
const CommonCategoryRouter = require("./common/category-routes");
const {checkRole} = require("../middlewares/checkRole");

function routes(app) {
  app.use("/api/auth", AuthRouter);
  app.use("/api/admin/products", checkRole(["admin"]), AdminProductRouter);
  app.use("/api/admin/contact", checkRole(["admin"]), AdminContactRouter);
  app.use("/api/admin/orders", checkRole(["admin"]), AdminOrderRouter);
  app.use("/api/admin/users", checkRole(["admin"]), AdminUserRouter);
  app.use("/api/admin/posts", checkRole(["admin"]), AdminPostRouter);
  app.use(
    "/api/admin/hero-banner",
    checkRole(["admin"]),
    AdminHeroBannerRouter,
  );
  app.use("/api/shop/products", checkRole(["client"]), ShoppingProductRouter);
  app.use("/api/shop/cart", checkRole(["client"]), ShoppingCartRouter);
  app.use("/api/shop/address", checkRole(["client"]), ShoppingAddressRouter);
  app.use("/api/shop/order", checkRole(["client"]), ShoppingOrderRouter);
  app.use("/api/shop/search", checkRole(["client"]), ShoppingSearchRouter);
  app.use("/api/shop/review", checkRole(["client"]), ShoppingReviewRouter);
  app.use("/api/shop/contact", checkRole(["client"]), ShoppingContactRouter);
  app.use(
    "/api/shop/blogcategory",
    checkRole(["client"]),
    ShoppingBlogCategoryRouter,
  );
  app.use("/api/shop/post", checkRole(["client"]), ShoppingPostRouter);
  app.use(
    "/api/shop/hero-banner",
    checkRole(["client"]),
    ShoppingHeroBannerRouter,
  );
  app.use(
    "/api/common/category",
    checkRole(["admin", "client"]),
    CommonCategoryRouter,
  );
}
module.exports = routes;
