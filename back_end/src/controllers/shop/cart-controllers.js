const Cart = require("../../models/Cart");
const addProductToCart = async (req, res) => {
  try {
    const {userId, productId, quantity} = req.body;
    if (!userId || !productId || !quantity) {
      return res.status(400).json({
        message: false,
        error: "Invalid data provided",
      });
    }
    let cart = await Cart.findOne({userId});
    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
      });
    }
    const findCurrentProductIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );
    if (findCurrentProductIndex === -1) {
      cart.items.push({productId, quantity});
    } else {
      cart.items[findCurrentProductIndex].quantity += quantity;
    }
    await cart.save();
    res.status(200).json({
      success: true,
      data: cart.toObject(),
    });
  } catch (error) {
    console.log(error);
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
        message: false,
        error: "User is required",
      });
    }
    const cart = await Cart.findOne({userId}).populate({
      path: "items.productId",
      select: "thumbnail name title description price discount stock",
    });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }
    // Lọc ra các item hợp lệ
    // Vì có thể có trường hợp sản phẩm đã bị xóa khỏi db nhưng vẫn còn trong giỏ hàng hoặc giỏ hàng chứa sản phẩm không tồn tại
    const validItems = (cart.items || []).filter((item) => item.productId);
    if (validItems.length < (cart.items || []).length) {
      cart.items = validItems;
      await cart.save();
    }
    const populateCartItems = validItems.map((item) => ({
      name: item.productId.name,
      productId: item.productId._id,
      image: item.productId.thumbnail,
      title: item.productId.title,
      price: item.productId.price,
      discount: item.productId.discount,
      thumbnail: item.productId.thumbnail,
      description: item.productId.description,
      stock: item.productId.stock,
      quantity: item.quantity,
    }));

    return res.status(200).json({
      success: true,
      data: {
        ...cart.toObject(),
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateCartItemQty = async (req, res) => {
  try {
    const {userId, productId, quantity} = req.body;
    if (!userId || !productId || !quantity) {
      return res.status(400).json({
        message: false,
        error: "Invalid data provided",
      });
    }
    const cart = await Cart.findOne({userId});
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }
    const findCurrentProductIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );
    if (findCurrentProductIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }
    cart.items[findCurrentProductIndex].quantity = quantity;
    await cart.save();
    await cart.populate({
      path: "items.productId",
      select: "thumbnail name title description price discount stock",
    });
    const populateCartItems = cart.items.map((item) => ({
      name: item.productId ? item.productId.name : null,
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.thumbnail : null,
      title: item.productId ? item.productId.title : null,
      price: item.productId ? item.productId.price : null,
      discount: item.productId ? item.productId.discount : null,
      thumbnail: item.productId ? item.productId.thumbnail : null,
      description: item.productId ? item.productId.description : null,
      stock: item.productId ? item.productId.stock : null,
      quantity: item.productId ? item.quantity : null,
    }));
    res.status(200).json({
      success: true,
      data: {
        ...cart.toObject(),
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    return res.json(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const {userId, productId} = req.body;
    if (!userId || !productId) {
      return res.status(400).json({
        message: false,
        error: "Invalid data provided",
      });
    }
    const cart = await Cart.findOne({userId}).populate({
      path: "items.productId",
      select: "thumbnail name title description price discount stock",
    });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }
    // delete item in cart
    cart.items = (cart.items || []).filter(
      (item) => item.productId._id.toString() !== productId,
    );
    await cart.save();

    const populateCartItems = cart.items.map((item) => ({
      name: item.productId ? item.productId.name : "Product not found",
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
    }));
    res.status(200).json({
      success: true,
      data: {
        ...cart.toObject(),
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};
module.exports = {
  addProductToCart,
  updateCartItemQty,
  deleteCartItem,
  fetchCartItems,
};
