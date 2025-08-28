const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

//Register
const registerUser = async (req, res) => {
  const {userName, password, email, gender, birthday} = req.body;
  try {
    // Kiểm tra user đã tồn tại
    const checkUser = await User.findOne({email});
    if (checkUser)
      return res.status(400).json({
        success: false,
        message: "Email already exists! Please try another email.",
      });

    // Kiểm tra độ dài password
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      userName,
      email,
      password: hashedPassword,
      gender: gender || "male",
      birthday: birthday ? new Date(birthday) : new Date("2000-01-01"),
      isActive: true,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Register successfully!",
      data: {
        id: newUser._id,
        userName: newUser.userName,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//login
const loginUser = async (req, res) => {
  const {email, password} = req.body;
  try {
    const checkUser = await User.findOne({email});
    if (!checkUser) {
      return res.status(400).json({
        success: false,
        message: "Email does not exist! Please try another email.",
      });
    }

    // Kiểm tra user có active không
    if (!checkUser.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is disabled. Please contact administrator.",
      });
    }

    const checkPassword = await bcrypt.compare(password, checkUser.password);
    if (!checkPassword) {
      return res.status(400).json({
        success: false,
        message: "Password is incorrect! Please try again.",
      });
    }

    // Cập nhật lastLoginAt
    await User.findByIdAndUpdate(checkUser._id, {
      lastLoginAt: new Date(),
    });

    // Tạo token
    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
        avatar: checkUser.avatar,
        isActive: checkUser.isActive,
      },
      "CLIENT_SECRET_KEY",
      {expiresIn: "10h"},
    );

    res.cookie("token", token, {
      path: "/",
      maxAge: 10 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.json({
      success: true,
      message: "Login successfully!",
      user: {
        id: checkUser._id,
        email: checkUser.email,
        role: checkUser.role,
        userName: checkUser.userName,
        avatar: checkUser.avatar,
        gender: checkUser.gender,
        birthday: checkUser.birthday,
        isActive: checkUser.isActive,
        lastLoginAt: new Date(),
        createdAt: checkUser.createdAt,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//logout
const logoutUser = async (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logout successfully !",
  });
};
const getInformation = async (req, res) => {
  try {
    const {id} = req.params;
    if (!id)
      return res.status(400).json({
        success: false,
        message: "Id is required",
      });
    const user = await User.findById(id, {password: 0});
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    res.status(200).json({
      success: true,
      message: "Get information successfully",
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const updateProfile = async (req, res) => {
  try {
    const {id, userName, email, birthday, gender, avatar} = req.body;
    if (!id || !userName || !email) {
      return res.status(400).json({
        success: false,
        message: "Id, userName, email are required",
      });
    }

    // Kiểm tra email có bị trùng với user khác không
    const existingUser = await User.findOne({email, _id: {$ne: id}});
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists with another account",
      });
    }

    const updateData = {
      userName,
      email,
      updatedAt: new Date(),
    };

    if (birthday) updateData.birthday = new Date(birthday);
    if (gender) updateData.gender = gender;
    if (avatar) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    res.status(200).json({
      success: true,
      message: "Update profile successfully",
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const changePassword = async (req, res) => {
  try {
    const {id, currentPassword, newPassword} = req.body;
    if (!id || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Id, currentPassword, newPassword are required",
      });
    }

    // Kiểm tra độ dài password mới
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const user = await User.findById(id);
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    const checkPassword = await bcrypt.compare(currentPassword, user.password);
    if (!checkPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect! Please try again.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(id, {
      password: hashedPassword,
      updatedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Change password successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
//auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - No token provided",
    });
  }
  try {
    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is disabled",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid token",
    });
  }
};
module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  updateProfile,
  getInformation,
  changePassword,
};
