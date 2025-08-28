const Order = require("../../models/Orders");

const getAllOrders = async (req, res) => {
  try {
    const {page = 1, limit = 10, search, status, userId} = req.query;

    const filter = {};

    // Tìm kiếm theo từ khóa
    if (search) {
      filter.$or = [
        {orderId: {$regex: search, $options: "i"}},
        {"shippingAddress.recipientName": {$regex: search, $options: "i"}},
        {"shippingAddress.phone": {$regex: search, $options: "i"}},
      ];
    }

    // Lọc theo status
    if (status) {
      filter.status = status;
    }

    // Lọc theo user
    if (userId) {
      filter.userId = userId;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(filter)
      .populate("userId", "name email phone")
      .populate("items.productId", "name slug thumbnail basePrice")
      .sort({createdAt: -1})
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getDetailOrder = async (req, res) => {
  try {
    const {id} = req.params;
    const order = await Order.findById(id)
      .populate("userId", "name email phone")
      .populate("items.productId", "name slug thumbnail basePrice")
      .populate("couponId", "code discountType discountValue");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updateOrderStatus = async (req, res) => {
  try {
    const {id} = req.params;
    const {status} = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: "Id and status are required",
      });
    }

    // Kiểm tra status hợp lệ
    const validStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      {
        status: status,
        updatedAt: new Date(),
      },
      {new: true},
    )
      .populate("userId", "name email phone")
      .populate("items.productId", "name slug thumbnail basePrice");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const statisticalOrdersAndRevenue = async (req, res) => {
  try {
    const orders = await Order.find().populate(
      "items.productId",
      "name category.name",
    );
    const dateNow = new Date();

    // Lấy thông tin tháng hiện tại
    const currentYear = dateNow.getFullYear();
    const currentMonth = dateNow.getMonth(); // 0-11

    // Lấy thông tin tháng trước
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Lọc đơn hàng theo tháng
    const currentMonthOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    });

    const lastMonthOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getMonth() === lastMonth &&
        orderDate.getFullYear() === lastMonthYear
      );
    });

    // Tính toán doanh thu
    const currentMonthRevenue = currentMonthOrders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0,
    );

    const lastMonthRevenue = lastMonthOrders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0,
    );

    // Tính tốc độ tăng trưởng
    const orderGrowthRate =
      lastMonthOrders.length === 0
        ? 100
        : ((currentMonthOrders.length - lastMonthOrders.length) /
            lastMonthOrders.length) *
          100;

    const revenueGrowthRate =
      lastMonthRevenue === 0
        ? 100
        : ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

    // Tính tổng doanh thu toàn thời gian
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0,
    );

    // Thống kê theo status
    const statusStats = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Thống kê theo payment method
    const paymentStats = orders.reduce((acc, order) => {
      const method = order.paymentMethod || "unknown";
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    // Doanh thu theo tháng (12 tháng gần nhất)
    const monthlyBusiness = [];
    for (let i = 11; i >= 0; i--) {
      const month = (currentMonth - i + 12) % 12;
      const year = currentMonth - i >= 0 ? currentYear : currentYear - 1;
      const thisMonthOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getMonth() === month && orderDate.getFullYear() === year
        );
      });
      const thisMonthRevenue = thisMonthOrders.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0,
      );
      monthlyBusiness.push({
        month: month + 1,
        year,
        revenue: thisMonthRevenue,
        orders: thisMonthOrders.length,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        currentMonth: currentMonth + 1,
        currentYear,
        statistics: {
          currentMonth: {
            orders: currentMonthOrders.length,
            revenue: currentMonthRevenue,
          },
          lastMonth: {
            orders: lastMonthOrders.length,
            revenue: lastMonthRevenue,
          },
          growth: {
            orders: orderGrowthRate.toFixed(2),
            revenue: revenueGrowthRate.toFixed(2),
          },
          total: {
            orders: orders.length,
            revenue: totalRevenue,
          },
          statusStats,
          paymentStats,
          monthlyBusiness,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllOrders,
  getDetailOrder,
  updateOrderStatus,
  statisticalOrdersAndRevenue,
};
