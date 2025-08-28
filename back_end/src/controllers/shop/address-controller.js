const {AddressModel: Address} = require("../../models/Address");

const addAddress = async (req, res) => {
  try {
    const {
      userId,
      detail,
      ward,
      district,
      city,
      country,
      phone,
      notes,
      isDefault = false,
    } = req.body;

    if (
      !userId ||
      !detail ||
      !ward ||
      !district ||
      !city ||
      !country ||
      !phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Nếu đây là địa chỉ mặc định, set tất cả địa chỉ khác của user về false
    if (isDefault) {
      await Address.updateMany({userId}, {$set: {isDefault: false}});
    }

    const newAddress = new Address({
      userId,
      detail,
      ward,
      district,
      city,
      country,
      phone,
      notes,
      isDefault,
    });

    await newAddress.save();

    return res.status(200).json({
      success: true,
      message: "Address added successfully",
      data: newAddress.toObject(),
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
  try {
    const {userId} = req.params;

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
      data: addresses.map((address) => address.toObject()),
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
  try {
    const {addressId} = req.params;
    const {userId, isDefault, ...updateData} = req.body;

    // Kiểm tra địa chỉ có tồn tại không
    const existingAddress = await Address.findById(addressId);
    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Nếu set làm địa chỉ mặc định, bỏ default của các địa chỉ khác
    if (isDefault && !existingAddress.isDefault) {
      await Address.updateMany(
        {userId: existingAddress.userId},
        {$set: {isDefault: false}},
      );
      updateData.isDefault = true;
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      updateData,
      {new: true},
    );

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
  try {
    const {addressId} = req.params;

    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Nếu xóa địa chỉ mặc định, set địa chỉ đầu tiên còn lại làm mặc định
    if (address.isDefault) {
      const remainingAddresses = await Address.find({
        userId: address.userId,
        _id: {$ne: addressId},
      }).limit(1);

      if (remainingAddresses.length > 0) {
        await Address.findByIdAndUpdate(remainingAddresses[0]._id, {
          isDefault: true,
        });
      }
    }

    await Address.findByIdAndDelete(addressId);

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
    const {userId} = req.body;

    // Kiểm tra địa chỉ có tồn tại không
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Set tất cả địa chỉ khác của user về false
    await Address.updateMany(
      {userId: address.userId},
      {$set: {isDefault: false}},
    );

    // Set địa chỉ này làm mặc định
    await Address.findByIdAndUpdate(addressId, {isDefault: true});

    return res.status(200).json({
      success: true,
      message: "Default address updated successfully",
    });
  } catch (error) {
    console.error("Set default address error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
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
