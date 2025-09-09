const {cleanObject} = require("../../helpers/filter");
const {TagModel} = require("../../models/Tag");

const getFilterTag = async (req, res) => {
  try {
    const {page, limit, sortBy, sortOrder} = cleanObject(req.query, [
      "page",
      "limit",
      "sortBy",
      "sortOrder",
    ]);
    const filter = {};

    const sortOption = {};
    if (typeof sortBy === "string" && ["name", "createdAt"].includes(sortBy)) {
      sortOption[sortBy] = sortOrder === "asc" ? 1 : -1;
    } else {
      sortOption["name"] = 1;
    }
    const query = TagModel.find(filter).sort(sortOption);
    const pageNumber = page ? (parseInt(page) ?? 1) : 1;
    const limitNumber = limit ? (parseInt(limit) ?? "all") : "all";
    if (limitNumber !== "all") {
      query.skip((pageNumber - 1) * limitNumber).limit(limitNumber);
    } else {
      query.skip((pageNumber - 1) * 10);
    }
    // Run count and query in parallel
    const [countRes, queryRes] = await Promise.allSettled([
      TagModel.countDocuments(filter).exec(),
      query.exec(),
    ]);

    const totalTags = countRes.status === "fulfilled" ? countRes.value : 0;
    const tags = queryRes.status === "fulfilled" ? queryRes.value : [];

    const totalPages =
      limitNumber === "all"
        ? 1
        : Math.max(1, Math.ceil(totalTags / limitNumber));

    return res.status(200).json({
      success: true,
      data: tags,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalItems: totalTags,
        totalPages,
        hasNextPage:
          limitNumber === "all" ? false : pageNumber * limitNumber < totalTags,
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("Get filter tags error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getFilterTag,
};
