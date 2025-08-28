const {CartItemModel: CartItem} = require("../../models/Cart");
const {ProductModel: Product} = require("../../models/Product");

const addProductToCart = async (req, res) => {
  try {
    const {userId, variantId, quantity = 1} = req.body;

    if (!userId || !variantId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, variantId, quantity",
      });
    }

    // Kiểm tra sản phẩm có tồn tại và available không
    const product = await Product.findOne({
      "variants._id": variantId,
      "isActive": true,
      "status": "inStock",
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found or not available",
      });
    }

    const variant = product.variants.id(variantId);
    if (!variant || variant.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock for this variant",
      });
    }

    // Kiểm tra xem item đã có trong cart chưa
    const existingCartItem = await CartItem.findOne({userId, variantId});

    if (existingCartItem) {
      // Cập nhật quantity
      const newQuantity = existingCartItem.quantity + quantity;

      if (newQuantity > variant.quantity) {
        return res.status(400).json({
          success: false,
          message: "Total quantity exceeds available stock",
        });
      }

      existingCartItem.quantity = newQuantity;
      await existingCartItem.save();

      return res.status(200).json({
        success: true,
        message: "Cart updated successfully",
        data: existingCartItem,
      });
    } else {
      // Tạo cart item mới
      const newCartItem = new CartItem({
        userId,
        variantId,
        quantity,
      });

      await newCartItem.save();

      return res.status(200).json({
        success: true,
        message: "Product added to cart successfully",
        data: newCartItem,
      });
    }
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const fetchCartItems = async (req, res) => {
  try {
    const {userId} = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Lấy tất cả cart items của user và populate thông tin product
    const cartItems = await CartItem.find({userId})
      .populate({
        path: "variantId",
        populate: {
          path: "productId",
          select:
            "name slug description images categoryId brandId basePrice discountPrice averageRating totalReviews",
          populate: [
            {path: "categoryId", select: "name slug"},
            {path: "brandId", select: "name slug logo"},
          ],
        },
      })
      .sort({createdAt: -1});

    // Lọc ra các items có variant và product hợp lệ
    const validCartItems = cartItems.filter(
      (item) =>
        item.variantId &&
        item.variantId.productId &&
        item.variantId.productId.isActive,
    );

    // Format dữ liệu cho frontend
    const formattedItems = validCartItems.map((item) => {
      const variant = item.variantId;
      const product = variant.productId;

      return {
        _id: item._id,
        cartItemId: item._id,
        productId: product._id,
        variantId: variant._id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        images: variant.images?.length > 0 ? variant.images : product.images,
        price: variant.price || product.basePrice,
        discountPrice: variant.discountPrice || product.discountPrice,
        category: product.categoryId,
        brand: product.brandId,
        averageRating: product.averageRating,
        totalReviews: product.totalReviews,
        attributes: variant.attributes,
        stock: variant.quantity,
        quantity: item.quantity,
        createdAt: item.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        items: formattedItems,
        totalItems: formattedItems.length,
        totalQuantity: formattedItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        ),
      },
    });
  } catch (error) {
    console.error("Fetch cart items error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateCartItemQty = async (req, res) => {
  try {
    const {userId, variantId, quantity} = req.body;

    if (!userId || !variantId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided. Quantity must be at least 1",
      });
    }

    // Tìm cart item
    const cartItem = await CartItem.findOne({userId, variantId});
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Kiểm tra stock
    const product = await Product.findOne({
      "variants._id": variantId,
      "isActive": true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or not available",
      });
    }

    const variant = product.variants.id(variantId);
    if (!variant || variant.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock. Available: " + (variant?.quantity || 0),
      });
    }

    // Cập nhật quantity
    cartItem.quantity = quantity;
    await cartItem.save();

    // Populate và trả về thông tin đầy đủ
    await cartItem.populate({
      path: "variantId",
      populate: {
        path: "productId",
        select: "name slug images basePrice discountPrice",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: cartItem,
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const {userId, variantId} = req.body;

    if (!userId || !variantId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, variantId",
      });
    }

    const deletedItem = await CartItem.findOneAndDelete({userId, variantId});

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cart item deleted successfully",
    });
  } catch (error) {
    console.error("Delete cart item error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const {userId} = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    await CartItem.deleteMany({userId});

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCartCount = async (req, res) => {
  try {
    const {userId} = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const totalItems = await CartItem.countDocuments({userId});
    const cartItems = await CartItem.find({userId});
    const totalQuantity = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return res.status(200).json({
      success: true,
      data: {
        totalItems,
        totalQuantity,
      },
    });
  } catch (error) {
    console.error("Get cart count error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  addProductToCart,
  fetchCartItems,
  updateCartItemQty,
  deleteCartItem,
  clearCart,
  getCartCount,
};
