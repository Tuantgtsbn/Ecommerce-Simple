const Address = require("../../models/Address");

const addAddress = async (req, res) => {
  try {
    const {
      userId,
      address,
      street,
      ward,
      district,
      city,
      country,
      phone,
      notes,
    } = req.body;
    if (
      !userId ||
      !address ||
      !ward ||
      !district ||
      !city ||
      !country ||
      !phone
    ) {
      return res.status(400).json({message: "Missing required fields"});
    }
    const newAddress = new Address({
      userId,
      address,
      street,
      ward,
      district,
      city,
      country,
      phone,
      notes,
    });
    await newAddress.save();
    return res.status(200).json({
      success: true,
      message: "Address added successfully",
      data: newAddress.toObject(),
    });
  } catch (error) {
    console.error(error);
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
      return res.status(400).json({message: "Missing userId"});
    }
    const addresses = await Address.find({userId});
    if (!addresses) {
      return res.status(404).json({message: "No addresses found"});
    }
    return res.status(200).json({
      success: true,
      message: "Addresses retrieved successfully",
      data: addresses.map((address) => address.toObject()),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const editAddress = async (req, res) => {
  try {
    const {addressId} = req.params;
    const formData = req.body;
    const address = await Address.findByIdAndUpdate(addressId, formData, {
      new: false,
    });
    if (!address) {
      return res.status(404).json({message: "Address not found"});
    }
    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: {...address.toObject(), ...formData},
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const {addressId} = req.params;
    const address = await Address.findByIdAndDelete(addressId);
    if (!address) return res.status(404).json({message: "Address not found"});
    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error(error);
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
};
