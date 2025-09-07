const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../../models/User");
const {filteredObject, cleanObject} = require("../../helpers/filter");

//Register
const registerUser = async (req, res) => {
  const filterd = filteredObject(req.body);
  const {userName, password, email, role, ...rest} = filterd;
  if (!userName || !password || !email || !role) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }
  try {
    // Kiểm tra user đã tồn tại
    const checkUser = await UserModel.findOne({email});
    if (checkUser)
      return res.status(400).json({
        success: false,
        message: "Email already exists! Please try another email.",
        errors: {
          email: "Email already exists",
        },
      });

    // Kiểm tra độ dài password
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
        errors: {
          password: "Password must be at least 6 characters long",
        },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({
      userName,
      email,
      password: hashedPassword,
      isActive: true,
      role: role,
      ...rest,
    });
    const {password: _, ...user} = newUser;
    res.status(201).json({
      success: true,
      message: "Register successfully!",
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

//login
const loginUserByEmail = async (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(429).json({
      success: false,
      message: "Email and password must be string",
    });
  }
  try {
    const checkUser = await UserModel.findOne({email});
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
    await UserModel.findByIdAndUpdate(checkUser.id, {
      lastLoginAt: new Date(),
    });

    // Tạo token
    const accessToken = jwt.sign(
      {
        id: checkUser.id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
        avatar: checkUser.avatar,
        isActive: checkUser.isActive,
      },
      process.env.ACCESS_TOKEN_SECRET_KEY,
      {expiresIn: "10h"},
    );

    const refreshToken = jwt.sign(
      {
        id: checkUser.id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
        avatar: checkUser.avatar,
        isActive: checkUser.isActive,
      },
      process.env.REFRESH_TOKEN_SECRET_KEY,
      {expiresIn: "7d"},
    );

    res.cookie("accessToken", accessToken, {
      path: "/",
      maxAge: 10 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    const {password: __, ...user} = checkUser.toObject();
    res.json({
      success: true,
      message: "Login successfully!",
      data: {
        user: user,
        accessToken,
        refreshToken,
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
  res.clearCookie("accessToken").json({
    success: true,
    message: "Logout successfully !",
  });
};

const getInformation = async (req, res) => {
  try {
    const {id} = req.user;
    if (!id)
      return res.status(400).json({
        success: false,
        message: "Id is required",
      });
    const user = await UserModel.findById(id, {password: 0});
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

const getMe = async (req, res) => {
  try {
    const {id} = req.user;
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const user = await UserModel.findById(id, {password: 0});
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
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  const {id, role} = req.user;
  try {
    const data = cleanObject(req.body, [
      "userId",
      "userName",
      "email",
      "role",
      "birthday",
      "gender",
      "avatar",
    ]);
    if (role !== "admin" && data.role) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to change role",
      });
    }
    if (role === "client" && data.userId && data.userId !== id) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to change other user's profile",
      });
    }
    if (data.email && typeof data.email == "string") {
      const existingUser = await UserModel.findOne({
        email: data.email,
        _id: {$ne: id},
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists with another account",
        });
      }
    }

    const updateData = {};
    if (data.userName) updateData.userName = data.userName;
    if (data.email) updateData.email = data.email;
    if (data.birthday) updateData.birthday = new Date(birthday);
    if (data.gender) updateData.gender = gender;
    if (data.avatar) updateData.avatar = avatar;

    const user = await UserModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
      context: "query",
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
  const {id} = req.user;
  try {
    const {currentPassword, newPassword} = req.body;
    if (!currentPassword || !newPassword) {
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

    const user = await UserModel.findById(id);
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    const checkPassword = await bcrypt.compare(currentPassword, user.password);
    if (!checkPassword) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect! Please try again.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserModel.findByIdAndUpdate(id, {
      password: hashedPassword,
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

module.exports = {
  registerUser,
  loginUserByEmail,
  logoutUser,
  updateProfile,
  getInformation,
  changePassword,
  getMe,
};
