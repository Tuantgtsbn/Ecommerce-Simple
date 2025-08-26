const router = require("express").Router();
const {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  reorderBanners,
  validateBannerData,
} = require("../../controllers/admin/heroBanner-controller");

router.get("/", getAllBanners);
router.get("/:id", getBannerById);
router.post("/", createBanner);
router.put("/:id", updateBanner);
router.delete("/:id", deleteBanner);
router.patch("/:id/toggle-status", toggleBannerStatus);
router.patch("/reorder", reorderBanners);
router.post("/validate", validateBannerData);
module.exports = router;
