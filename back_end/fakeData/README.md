# Fake Data Documentation

## Tổng quan

Thư mục này chứa dữ liệu giả (fake data) cho tất cả các schema trong hệ thống ecommerce. Dữ liệu được tạo với các liên kết chính xác giữa các collection để đảm bảo tính toàn vẹn referential integrity.

## Cấu trúc dữ liệu và liên kết

### 1. Users Collection (users.json)

- **\_id**: ObjectId chính
- **Roles**: admin, client, staff
- **Liên kết với**: Orders, Addresses, Reviews, CartItems, WishLists, Contacts, Sessions, Posts, BannerHeros

### 2. Categories Collection (categories.json)

- **\_id**: ObjectId chính
- **parentCategoryId**: Tự tham chiếu để tạo hierarchy
- **Hierarchy**: Electronics > Smartphones, Laptops; Clothing > Men's Clothing, Women's Clothing
- **Liên kết với**: Products, Coupons

### 3. Brands Collection (brands.json)

- **\_id**: ObjectId chính
- **Brands**: Apple, Samsung, Nike, Adidas, Dell
- **Liên kết với**: Products

### 4. Tags Collection (tags.json)

- **\_id**: ObjectId chính
- **Tags**: sale, new, featured, bestseller, trending
- **Liên kết với**: Products, Posts

### 5. Products Collection (products.json)

- **\_id**: ObjectId chính
- **brandId**: Tham chiếu đến Brands
- **categoryId**: Tham chiếu đến Categories
- **tags**: Array tham chiếu đến Tags
- **Embedded data**: category, brand info để optimize queries
- **Products**: iPhone 15 Pro, Samsung Galaxy S24, Dell XPS 13, Nike Air Max 270

### 6. Addresses Collection (addresses.json)

- **\_id**: ObjectId chính
- **userId**: Tham chiếu đến Users
- **Địa chỉ**: Các địa chỉ tại TP.HCM, Việt Nam

### 7. ShippingProviders Collection (shippingProviders.json)

- **\_id**: ObjectId chính
- **Providers**: Giao Hang Nhanh, Viettel Post
- **Liên kết với**: Orders

### 8. Coupons Collection (coupons.json)

- **\_id**: ObjectId chính
- **Types**: all, category-specific
- **couponCategories**: Array tham chiếu đến Categories (cho category-specific coupons)
- **Coupons**: SUMMER2024, NEWUSER50, ELECTRONICS15

### 9. Orders Collection (orders.json)

- **\_id**: ObjectId chính
- **userId**: Tham chiếu đến Users
- **orderItems.variantId**: Tham chiếu đến Products (variant)
- **shippingAddress.addressId**: Tham chiếu đến Addresses
- **couponId**: Tham chiếu đến Coupons
- **paymentId**: Tham chiếu đến Payments
- **shipping.providerId**: Tham chiếu đến ShippingProviders
- **Status**: pending, confirmed, inShipping, delivered

### 10. Payments Collection (payments.json)

- **\_id**: ObjectId chính
- **orderId**: Tham chiếu đến Orders (one-to-one)
- **Methods**: cash, paypal, credit_card
- **Status**: pending, paid, failed, refunded

### 11. CartItems Collection (cartItems.json)

- **\_id**: ObjectId chính
- **userId**: Tham chiếu đến Users
- **variantId**: Tham chiếu đến Products
- **Constraint**: Unique index trên (userId, variantId)

### 12. Reviews Collection (reviews.json)

- **\_id**: ObjectId chính
- **userId**: Tham chiếu đến Users
- **productId**: Tham chiếu đến Products
- **variantId**: Tham chiếu đến Products
- **Ratings**: 1-5 stars

### 13. WishLists Collection (wishlists.json)

- **\_id**: ObjectId chính
- **userId**: Tham chiếu đến Users
- **items**: Array tham chiếu đến Products (variants)

### 14. Contacts Collection (contacts.json)

- **\_id**: ObjectId chính
- **userId**: Tham chiếu đến Users (có thể null cho guest users)
- **isRead**: Boolean để track status

### 15. Sessions Collection (sessions.json)

- **\_id**: ObjectId chính
- **userId**: Tham chiếu đến Users
- **expiresAt**: TTL index để tự động cleanup

### 16. BannerHeros Collection (bannerHeros.json)

- **\_id**: ObjectId chính
- **createBy/updateBy**: Tham chiếu đến Users
- **Images**: Responsive images cho desktop, tablet, mobile
- **Status**: active/inactive với date ranges

### 17. BlogCategories Collection (blogCategories.json)

- **\_id**: ObjectId chính
- **Categories**: Technology News, Product Reviews, Shopping Guides, Industry Trends
- **Liên kết với**: Posts

### 18. Posts Collection (posts.json)

- **\_id**: ObjectId chính
- **author.authorId**: Tham chiếu đến Users
- **categories.categoryId**: Array tham chiếu đến BlogCategories
- **tags.tagId**: Array tham chiếu đến Tags
- **Status**: draft, published, scheduled, rejected

### 19. OrderStatusHistory Collection (orderStatusHistory.json)

- **\_id**: ObjectId chính
- **orderId**: Tham chiếu đến Orders
- **Tracking**: Lịch sử thay đổi status của orders

## Dữ liệu mẫu

- **5 Users**: 1 admin, 1 staff, 3 clients
- **6 Categories**: Hierarchical structure
- **5 Brands**: Major technology và fashion brands
- **5 Tags**: Common product tags
- **4 Products**: Diverse products across categories
- **3 Addresses**: Vietnam addresses
- **2 Shipping Providers**: Local Vietnamese providers
- **3 Coupons**: Different discount types
- **3 Orders**: Complete order lifecycle
- **3 Payments**: Different payment methods
- **4 Cart Items**: Active shopping carts
- **5 Reviews**: Product reviews
- **3 Wishlists**: User wishlist data
- **4 Contacts**: Customer service messages
- **4 Sessions**: Active user sessions
- **3 Banner Heroes**: Homepage banners
- **4 Blog Categories**: Content categories
- **3 Posts**: Published blog content
- **9 Order Status History**: Order tracking records

## Quan hệ dữ liệu quan trọng

1. **Users** là central entity liên kết với hầu hết các collections khác
2. **Products** liên kết với Categories, Brands, Tags, Reviews, CartItems, WishLists, Orders
3. **Orders** có quan hệ phức tạp với Users, Products, Addresses, Payments, ShippingProviders, Coupons
4. **Hierarchical Categories** để support nested categorization
5. **Order Status History** để track order lifecycle
6. **Blog system** với Posts, BlogCategories, và Tags

## Sử dụng

1. Import các file JSON vào MongoDB collections tương ứng
2. Đảm bảo các index được tạo theo schema definitions
3. Kiểm tra referential integrity sau khi import
4. Dữ liệu có thể được mở rộng bằng cách thêm records mới với ObjectId references chính xác
