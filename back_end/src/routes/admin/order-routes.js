const router = require('express').Router();
const {
    getAllOrders,
    getDetailOrder,
    updateOrderStatus,
    statisticalOrdersAndRevenue
} = require('../../controllers/admin/order-controller');

// Đặt route cụ thể trước route động
router.get('/statisticalOrdersAndRevenues', statisticalOrdersAndRevenue);
router.get('/', getAllOrders);
router.get('/:id', getDetailOrder);
router.put('/:id', updateOrderStatus);

module.exports = router;
