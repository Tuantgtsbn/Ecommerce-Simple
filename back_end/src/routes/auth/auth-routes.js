const express = require("express");
const router = express.Router();
const {
  loginUserByEmail,
  registerUser,
  logoutUser,
  getInformation,
  getMe,
  updateProfile,
  changePassword,
} = require("../../controllers/auth/auth-controller");
router.post("/login", loginUserByEmail);
router.post("/register", registerUser);
router.post("/logout", logoutUser);
router.get("/get-me", getMe);
router.get("/:id", getInformation);
router.put("/update-profile", updateProfile);
router.post("/change-password", changePassword);
module.exports = router;
