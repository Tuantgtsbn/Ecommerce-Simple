const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_KEY = process.env.ACCESS_TOKEN_SECRET_KEY;

const validateToken = (req, res, next) => {
  if (req.path === "/api/auth/login" && req.method === "POST") {
    return next();
  }
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Some thing wrong!",
    });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    let token = req.user;
    if (!token) {
      token = req.cookies.accessToken;
    }
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    if (!roles.includes(token.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }
    next();
  };
};

module.exports = {validateToken, checkRole};
