const {BrandModel, ShopModel} = require("../../models/ShopBrand");

// Helper to escape regex special chars for case-insensitive exact match
function escapeRegex(text) {
  return text.replace(/[-\\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

// ----- Brand handlers -----
async function addBrand(req, res) {
  try {
    const {name, description = "", logo, isActive = true} = req.body || {};
    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({success: false, message: "Brand name is required"});
    }

    const q = new RegExp(`^${escapeRegex(name.trim())}$`, "i");
    const existing = await BrandModel.findOne({name: q});
    if (existing) {
      return res
        .status(409)
        .json({success: false, message: "Brand name already exists"});
    }

    const brand = new BrandModel({
      name: name.trim(),
      description,
      logo,
      isActive,
    });
    await brand.save();
    return res
      .status(201)
      .json({success: true, message: "Brand created", data: brand});
  } catch (err) {
    console.error("addBrand error:", err);
    return res.status(500).json({success: false, message: "Server error"});
  }
}

async function updateBrand(req, res) {
  try {
    const {id} = req.params;
    const updates = req.body || {};
    const brand = await BrandModel.findById(id);
    if (!brand)
      return res.status(404).json({success: false, message: "Brand not found"});

    if (
      updates.name &&
      updates.name.trim() &&
      updates.name.trim() !== brand.name
    ) {
      const q = new RegExp(`^${escapeRegex(updates.name.trim())}$`, "i");
      const other = await BrandModel.findOne({name: q, _id: {$ne: brand._id}});
      if (other)
        return res.status(409).json({
          success: false,
          message: "Another brand with this name exists",
        });
      brand.name = updates.name.trim();
    }

    if (typeof updates.description !== "undefined")
      brand.description = updates.description;
    if (typeof updates.logo !== "undefined") brand.logo = updates.logo;
    if (typeof updates.isActive !== "undefined")
      brand.isActive = updates.isActive;

    await brand.save();
    return res.json({success: true, message: "Brand updated", data: brand});
  } catch (err) {
    console.error("updateBrand error:", err);
    return res.status(500).json({success: false, message: "Server error"});
  }
}

async function deleteBrand(req, res) {
  try {
    const {id} = req.params;
    const brand = await BrandModel.findByIdAndDelete(id);
    if (!brand)
      return res.status(404).json({success: false, message: "Brand not found"});
    return res.json({success: true, message: "Brand deleted", data: brand});
  } catch (err) {
    console.error("deleteBrand error:", err);
    return res.status(500).json({success: false, message: "Server error"});
  }
}

// ----- Shop handlers -----
async function addShop(req, res) {
  try {
    const body = req.body || {};
    const {
      name,
      address,
      phone,
      email,
      website,
      logo,
      description,
      socialMedia,
      businessHours,
      settings,
      policies,
    } = body;

    if (!name || !name.trim())
      return res
        .status(400)
        .json({success: false, message: "Shop name is required"});
    if (
      !address ||
      !address.detail ||
      !address.ward ||
      !address.district ||
      !address.city
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete address is required (detail, ward, district, city)",
      });
    }
    if (!phone || !phone.trim())
      return res
        .status(400)
        .json({success: false, message: "Phone is required"});
    if (!email || !email.trim())
      return res
        .status(400)
        .json({success: false, message: "Email is required"});

    const shop = new ShopModel({
      name: name.trim(),
      address,
      phone: phone.trim(),
      email: email.trim(),
      website,
      logo,
      description,
      socialMedia,
      businessHours,
      settings,
      policies,
    });

    await shop.save();
    return res
      .status(201)
      .json({success: true, message: "Shop created", data: shop});
  } catch (err) {
    console.error("addShop error:", err);
    return res.status(500).json({success: false, message: "Server error"});
  }
}

async function updateShop(req, res) {
  try {
    const {id} = req.params;
    const updates = req.body || {};
    const shop = await ShopModel.findById(id);
    if (!shop)
      return res.status(404).json({success: false, message: "Shop not found"});

    if (
      typeof updates.name !== "undefined" &&
      updates.name &&
      updates.name.trim()
    )
      shop.name = updates.name.trim();
    if (typeof updates.address !== "undefined" && updates.address) {
      // shallow merge for address fields
      shop.address = Object.assign(
        {},
        shop.address ? shop.address.toObject() : {},
        updates.address,
      );
    }
    if (typeof updates.phone !== "undefined") shop.phone = updates.phone;
    if (typeof updates.email !== "undefined") shop.email = updates.email;
    if (typeof updates.website !== "undefined") shop.website = updates.website;
    if (typeof updates.logo !== "undefined") shop.logo = updates.logo;
    if (typeof updates.description !== "undefined")
      shop.description = updates.description;
    if (typeof updates.socialMedia !== "undefined")
      shop.socialMedia = Object.assign(
        {},
        shop.socialMedia ? shop.socialMedia.toObject() : {},
        updates.socialMedia,
      );
    if (typeof updates.businessHours !== "undefined")
      shop.businessHours = Object.assign(
        {},
        shop.businessHours ? shop.businessHours.toObject() : {},
        updates.businessHours,
      );
    if (typeof updates.settings !== "undefined")
      shop.settings = Object.assign(
        {},
        shop.settings ? shop.settings.toObject() : {},
        updates.settings,
      );
    if (typeof updates.policies !== "undefined")
      shop.policies = Object.assign(
        {},
        shop.policies ? shop.policies.toObject() : {},
        updates.policies,
      );

    await shop.save();
    return res.json({success: true, message: "Shop updated", data: shop});
  } catch (err) {
    console.error("updateShop error:", err);
    return res.status(500).json({success: false, message: "Server error"});
  }
}

async function deleteShop(req, res) {
  try {
    const {id} = req.params;
    const shop = await ShopModel.findByIdAndDelete(id);
    if (!shop)
      return res.status(404).json({success: false, message: "Shop not found"});
    return res.json({success: true, message: "Shop deleted", data: shop});
  } catch (err) {
    console.error("deleteShop error:", err);
    return res.status(500).json({success: false, message: "Server error"});
  }
}

module.exports = {
  addBrand,
  updateBrand,
  deleteBrand,
  addShop,
  updateShop,
  deleteShop,
};
