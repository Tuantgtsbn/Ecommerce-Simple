const router = require("express").Router();
const {statisticalUsers} = require("../../controllers/admin/user-controller");
router.get("/statisticalUsers", statisticalUsers);
module.exports = router;
