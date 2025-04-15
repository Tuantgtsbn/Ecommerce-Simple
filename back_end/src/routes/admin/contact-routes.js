const {
    getDetailContact,
    getListContact,
    updateContact
} = require('../../controllers/admin/contact-controller');

const router = require('express').Router();
router.get('/:id', getDetailContact);
router.get('/', getListContact);
router.put('/:id', updateContact);
module.exports = router;
