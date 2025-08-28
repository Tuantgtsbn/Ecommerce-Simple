const {uploadImagesProduct, deleteImages} = require("../../helpers/upLoad");
const {ProductModel: Product} = require("../../models/Product");
const {extractPublicId} = require("cloudinary-build-url");
const {generateUniqueSlug} = require("../../helpers/slug");
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      title,
      categoryId,
      brandId,
      category,
      brand,
      attributes,
      basePrice,
      quantity,
      maxDiscount,
      status,
      tags,
    } = req.body;

    console.log("Files", req.files);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images uploaded",
      });
    }

    const {thumbnail, images} = await uploadImagesProduct(req.files);

    const newProduct = new Product({
      name,
      description,
      title,
      categoryId,
      brandId,
      category,
      brand,
      attributes: attributes || [],
      basePrice: Number(basePrice),
      quantity: Number(quantity) || 0,
      maxDiscount: Number(maxDiscount) || 0,
      status: status || "inStock",
      thumbnail: {
        desktop: thumbnail,
        tablet: thumbnail,
        mobile: thumbnail,
      },
      images: {
        desktop: images,
        tablet: images,
        mobile: images,
      },
      tags: tags || [],
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Upload file failed",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  const {id} = req.params;
  try {
    const updatedProduct = await Product.findById(id);
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      name,
      description,
      title,
      categoryId,
      brandId,
      category,
      brand,
      attributes,
      basePrice,
      quantity,
      maxDiscount,
      status,
      tags,
      isActive,
    } = req.body;

    // Cập nhật các trường có giá trị mới
    if (name !== undefined) updatedProduct.name = name;
    if (description !== undefined) updatedProduct.description = description;
    if (title !== undefined) updatedProduct.title = title;
    if (categoryId !== undefined) updatedProduct.categoryId = categoryId;
    if (brandId !== undefined) updatedProduct.brandId = brandId;
    if (category !== undefined) updatedProduct.category = category;
    if (brand !== undefined) updatedProduct.brand = brand;
    if (attributes !== undefined) updatedProduct.attributes = attributes;
    if (basePrice !== undefined) updatedProduct.basePrice = Number(basePrice);
    if (quantity !== undefined) updatedProduct.quantity = Number(quantity);
    if (maxDiscount !== undefined)
      updatedProduct.maxDiscount = Number(maxDiscount);
    if (status !== undefined) updatedProduct.status = status;
    if (tags !== undefined) updatedProduct.tags = tags;
    if (isActive !== undefined) updatedProduct.isActive = isActive;

    // Tự động tạo slug mới nếu tên thay đổi
    if (name && name !== updatedProduct.name) {
      updatedProduct.slug = await generateUniqueSlug("Product", name, id);
    }

    await updatedProduct.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  const {id} = req.params;
  try {
    const deletedProduct = await Product.findById(id);
    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await deletedProduct.deleteOne();

    // Xóa images từ cloud storage
    const imagesToDelete = [];

    // Thêm thumbnail images
    if (deletedProduct.thumbnail?.desktop) {
      imagesToDelete.push(
        ...deletedProduct.thumbnail.desktop.map((img) => extractPublicId(img)),
      );
    }
    if (deletedProduct.thumbnail?.tablet) {
      imagesToDelete.push(
        ...deletedProduct.thumbnail.tablet.map((img) => extractPublicId(img)),
      );
    }
    if (deletedProduct.thumbnail?.mobile) {
      imagesToDelete.push(
        ...deletedProduct.thumbnail.mobile.map((img) => extractPublicId(img)),
      );
    }

    // Thêm main images
    if (deletedProduct.images?.desktop) {
      imagesToDelete.push(
        ...deletedProduct.images.desktop.map((img) => extractPublicId(img)),
      );
    }
    if (deletedProduct.images?.tablet) {
      imagesToDelete.push(
        ...deletedProduct.images.tablet.map((img) => extractPublicId(img)),
      );
    }
    if (deletedProduct.images?.mobile) {
      imagesToDelete.push(
        ...deletedProduct.images.mobile.map((img) => extractPublicId(img)),
      );
    }

    if (imagesToDelete.length > 0) {
      await deleteImages(imagesToDelete);
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      brandId,
      status,
      isActive,
    } = req.query;

    const filter = {};

    // Tìm kiếm theo từ khóa
    if (search) {
      filter.$or = [
        {name: {$regex: search, $options: "i"}},
        {title: {$regex: search, $options: "i"}},
        {description: {$regex: search, $options: "i"}},
      ];
    }

    // Lọc theo category
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    // Lọc theo brand
    if (brandId) {
      filter.brandId = brandId;
    }

    // Lọc theo status
    if (status) {
      filter.status = status;
    }

    // Lọc theo trạng thái active
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(filter)
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug logo")
      .populate("tags", "name slug")
      .sort({createdAt: -1})
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug logo")
      .populate("tags", "name slug");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const statisticalProducts = async (req, res) => {
  try {
    const products = await Product.find();
    const dateNow = new Date();
    const dayOfNow = dateNow.getDate();

    // Sản phẩm mới trong tháng
    const newProducts = products.filter((product) => {
      const createdDate = new Date(product.createdAt);
      const timeDiff = dateNow.getTime() - createdDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return daysDiff <= 30; // 30 ngày gần đây
    });

    // Thống kê theo status
    const statusStats = products.reduce((acc, product) => {
      acc[product.status] = (acc[product.status] || 0) + 1;
      return acc;
    }, {});

    // Thống kê theo category
    const categoryStats = {};
    products.forEach((product) => {
      const categoryName = product.category?.name || "Unknown";
      categoryStats[categoryName] = (categoryStats[categoryName] || 0) + 1;
    });

    // Thống kê theo brand
    const brandStats = {};
    products.forEach((product) => {
      const brandName = product.brand?.name || "Unknown";
      brandStats[brandName] = (brandStats[brandName] || 0) + 1;
    });

    // Sản phẩm sắp hết hàng (quantity < 10)
    const lowStockProducts = products.filter(
      (product) => product.quantity < 10,
    ).length;

    res.status(200).json({
      success: true,
      data: {
        total: products.length,
        newProducts: newProducts.length,
        lowStockProducts,
        statusStats,
        categoryStats,
        brandStats,
        activeProducts: products.filter((p) => p.isActive).length,
        inactiveProducts: products.filter((p) => !p.isActive).length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getAllProducts,
  statisticalProducts,
};
