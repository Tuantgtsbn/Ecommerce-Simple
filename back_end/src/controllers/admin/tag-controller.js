const {TagModel: Tag} = require("../../models/Tag");

const addTag = async (req, res) => {
  try {
    const {name} = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res
        .status(400)
        .json({success: false, message: "Tag name is required"});
    }

    const existing = await Tag.findOne({name: name.trim()});
    if (existing) {
      return res
        .status(409)
        .json({success: false, message: "Tag with this name already exists"});
    }

    const newTag = new Tag({name: name.trim()});
    await newTag.save();

    return res
      .status(201)
      .json({success: true, message: "Tag created", data: newTag});
  } catch (error) {
    console.error("Add tag error:", error);
    return res.status(500).json({success: false, message: error.message});
  }
};

const updateTag = async (req, res) => {
  try {
    const {id} = req.params;
    const {name} = req.body;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({success: false, message: "Tag not found"});
    }

    if (name !== undefined) {
      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Tag name must be a non-empty string",
        });
      }
      const conflict = await Tag.findOne({name: name.trim(), _id: {$ne: id}});
      if (conflict) {
        return res.status(409).json({
          success: false,
          message: "Another tag with this name already exists",
        });
      }
      tag.name = name.trim();
    }

    await tag.save();

    return res
      .status(200)
      .json({success: true, message: "Tag updated", data: tag});
  } catch (error) {
    console.error("Update tag error:", error);
    return res.status(500).json({success: false, message: error.message});
  }
};

const deleteTag = async (req, res) => {
  try {
    const {id} = req.params;
    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({success: false, message: "Tag not found"});
    }

    await tag.deleteOne();
    return res.status(200).json({success: true, message: "Tag deleted"});
  } catch (error) {
    console.error("Delete tag error:", error);
    return res.status(500).json({success: false, message: error.message});
  }
};

module.exports = {addTag, updateTag, deleteTag};
