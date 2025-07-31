const express = require("express");
const router = express.Router();
const {
  loginUser,
  registerUser,
  logoutUser,
  authMiddleware,
  getInformation,
  updateProfile,
  changePassword,
} = require("../../controllers/auth/auth-controller");
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/logout", logoutUser);
router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;
  console.log("User:", user);
  res.status(200).json({
    success: true,
    message: "Authorized",
    data: user,
  });
});
router.get("/:id", getInformation);
router.put("/update-profile", updateProfile);
router.post("/change-password", changePassword);
module.exports = router;
