const router = require("express").Router();
const {
  getActiveBanners,
} = require("../../controllers/shop/bannerHero-controller");
router.get("/", getActiveBanners);
module.exports = router;
