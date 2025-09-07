const {CartItemModel: CartItem} = require("../../models/Cart");
const {
  ProductModel: Product,
  ProductVariantModel,
} = require("../../models/Product");
const {mongoose} = require("../../config/db");

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
    const productVariant = await ProductVariantModel.findOne({
      _id: variantId,
      isActive: true,
    }).populate("productId");

    if (!productVariant || productVariant.quantity < 1) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found or not available",
      });
    }

    if (productVariant.quantity < quantity) {
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

      if (newQuantity > productVariant.quantity) {
        existingCartItem.quantity = productVariant.quantity;
        await existingCartItem.save();
        return res.status(200).json({
          success: false,
          message:
            "Quantity is adjusted to available stock: " +
            productVariant.quantity,
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
        quantity: Math.min(quantity, productVariant.quantity),
      });

      await newCartItem.save();

      return res.status(200).json({
        success: true,
        message: "Product added to cart successfully",
        data: newCartItem,
      });
    }
  } catch (error) {
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

    const cartItems = await CartItem.aggregate([
      {$match: {userId: mongoose.Types.ObjectId(userId)}},
      {
        $lookup: {
          from: "productVariants",
          localField: "variantId",
          foreignField: "_id",
          as: "variant",
        },
      },
      {$unwind: {path: "$variant", preserveNullAndEmptyArrays: false}},
      {
        $lookup: {
          from: "products",
          localField: "variant.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {$unwind: {path: "$product", preserveNullAndEmptyArrays: false}},
      // rename fields so output matches expected shape used later in code
      {
        $addFields: {
          "variantId": "$variant",
          "variantId.productId": "$product",
        },
      },
      // remove temporary fields
      {$project: {variant: 0, product: 0}},
    ]);

    return res.status(200).json({
      success: true,
      data: cartItems,
      message: "Cart items retrieved successfully",
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
    const productVariant = await ProductVariantModel.findOne({
      _id: variantId,
      isActive: true,
    });

    if (!productVariant) {
      return res.status(404).json({
        success: false,
        message: "Product not found or not available",
      });
    }

    if (productVariant.quantity < quantity) {
      cartItem.quantity = productVariant.quantity;
      await cartItem.save();
      return res.status(200).json({
        success: false,
        message:
          "Quantity is adjusted to available stock: " + productVariant.quantity,
      });
    }

    // Cập nhật quantity
    cartItem.quantity = quantity;
    await cartItem.save();

    const updatedCartItem = await CartItem.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          variantId: mongoose.Types.ObjectId(variantId),
        },
      },
      {
        $lookup: {
          from: "productVariants",
          localField: "variantId",
          foreignField: "_id",
          as: "variant",
        },
      },
      {
        $unwind: {path: "$variant", preserveNullAndEmptyArrays: false},
      },
      {
        $lookup: {
          from: "products",
          localField: "variant.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {$unwind: {path: "$product", preserveNullAndEmptyArrays: false}},
      // rename fields so output matches expected shape used later in code
      {
        $addFields: {
          "variantId": "$variant",
          "variantId.productId": "$product",
        },
      },
      // remove temporary fields
      {$project: {variant: 0, product: 0}},
    ]);

    return res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: updatedCartItem[0],
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

module.exports = {
  addProductToCart,
  fetchCartItems,
  updateCartItemQty,
  deleteCartItem,
  clearCart,
};
