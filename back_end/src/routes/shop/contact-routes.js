const {submitContact} = require("../../controllers/shop/contact-controller");

const router = require("express").Router();
router.post("/", submitContact);
module.exports = router;
