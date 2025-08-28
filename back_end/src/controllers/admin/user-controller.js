const User = require("../../models/User");

const getAllUsers = async (req, res) => {
  try {
    const {page = 1, limit = 10, search, role, isActive} = req.query;

    const filter = {};

    // Tìm kiếm theo từ khóa
    if (search) {
      filter.$or = [
        {name: {$regex: search, $options: "i"}},
        {email: {$regex: search, $options: "i"}},
        {phone: {$regex: search, $options: "i"}},
      ];
    }

    // Lọc theo role
    if (role) {
      filter.role = role;
    }

    // Lọc theo trạng thái active
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(filter)
      .select("-password") // Không trả về password
      .sort({createdAt: -1})
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
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

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    // Không cho phép cập nhật password thông qua endpoint này
    delete updates.password;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {$set: {...updates, updatedAt: new Date()}},
      {new: true},
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const statisticalUsers = async (req, res) => {
  try {
    const users = await User.find({});
    const dateNow = new Date();

    // Người dùng mới trong tháng
    const newUsers = users.filter((user) => {
      const createdDate = new Date(user.createdAt);
      const timeDiff = dateNow.getTime() - createdDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return daysDiff <= 30; // 30 ngày gần đây
    });

    // Thống kê theo role
    const roleStats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    // Thống kê theo trạng thái
    const activeUsers = users.filter((user) => user.isActive).length;
    const inactiveUsers = users.filter((user) => !user.isActive).length;

    // Thống kê theo gender (nếu có)
    const genderStats = users.reduce((acc, user) => {
      if (user.gender) {
        acc[user.gender] = (acc[user.gender] || 0) + 1;
      }
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: {
        total: users.length,
        newUsers: newUsers.length,
        activeUsers,
        inactiveUsers,
        roleStats,
        genderStats,
        clientUsers: users.filter((u) => u.role === "client").length,
        adminUsers: users.filter((u) => u.role === "admin").length,
        staffUsers: users.filter((u) => u.role === "staff").length,
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
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  statisticalUsers,
};
