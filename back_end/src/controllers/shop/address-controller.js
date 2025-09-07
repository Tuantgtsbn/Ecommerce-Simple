const {cleanObject} = require("../../helpers/filter");
const {AddressModel: Address} = require("../../models/Address");

const addAddress = async (req, res) => {
  const {id} = req.user;
  try {
    const {detail, ward, district, city, country, phone, ...rest} = req.body;

    if (!detail || !ward || !district || !city || !country || !phone) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Nếu đây là địa chỉ mặc định, set tất cả địa chỉ khác của user về false
    if (res.isDefault) {
      await Address.updateMany({userId}, {$set: {isDefault: false}});
    }

    const newAddress = await Address.create({
      userId: id,
      detail,
      ward,
      district,
      city,
      country,
      phone,
      ...rest,
    });

    return res.status(200).json({
      success: true,
      message: "Address added successfully",
      data: newAddress.toJSON(),
    });
  } catch (error) {
    console.error("Add address error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getListAddress = async (req, res) => {
  const {id: userId} = req.user;
  try {
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing userId",
      });
    }

    const addresses = await Address.find({userId}).sort({
      isDefault: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Addresses retrieved successfully",
      data: addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const editAddress = async (req, res) => {
  const {id: userId} = req.user;
  try {
    const {addressId} = req.params;
    const data = cleanObject(req.body, [
      "detail",
      "ward",
      "district",
      "city",
      "country",
      "phone",
      "notes",
      "isDefault",
    ]);

    // Kiểm tra địa chỉ có tồn tại không
    const existingAddress = await Address.findById(addressId);
    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }
    // Kiểm tra quyền chỉnh sửa
    if (existingAddress.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to edit this address",
      });
    }

    // Nếu set làm địa chỉ mặc định, bỏ default của các địa chỉ khác
    if (data.isDefault && !existingAddress.isDefault) {
      await Address.updateMany(
        {userId: existingAddress.userId},
        {$set: {isDefault: false}},
      );
    }
    if (data.isDefault === false && existingAddress.isDefault) {
      await Address.findOneAndUpdate(
        {
          userId: existingAddress.userId,
          _id: {$ne: addressId},
        },
        {
          $set: {
            isDefault: true,
          },
        },
      );
    }

    const updatedAddress = await Address.findByIdAndUpdate(addressId, data, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: updatedAddress.toObject(),
    });
  } catch (error) {
    console.error("Edit address error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteAddress = async (req, res) => {
  const {id: userId} = req.user;
  try {
    const {addressId} = req.params;

    const address = await Address.findOne({
      _id: addressId,
      userId: userId,
    });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Nếu xóa địa chỉ mặc định, set địa chỉ đầu tiên còn lại làm mặc định
    if (address.isDefault) {
      const remainingAddresses = await Address.find({
        userId: userId,
        _id: {$ne: addressId},
      }).limit(1);

      if (remainingAddresses.length > 0) {
        await Address.findByIdAndUpdate(remainingAddresses[0]._id, {
          isDefault: true,
        });
      }
    }

    await address.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete address error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const {addressId} = req.params;
    const {id: userId} = req.user;

    // Kiểm tra địa chỉ có tồn tại không
    const address = await Address.findOne({
      _id: addressId,
      userId: userId,
    });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Set tất cả địa chỉ khác của user về false
    await Address.updateMany({userId: userId}, {$set: {isDefault: false}});

    // Set địa chỉ này làm mặc định
    await Address.findByIdAndUpdate(addressId, {isDefault: true});

    return res.status(200).json({
      success: true,
      message: "This address is now the default address successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

module.exports = {
  addAddress,
  getListAddress,
  editAddress,
  deleteAddress,
  setDefaultAddress,
};
