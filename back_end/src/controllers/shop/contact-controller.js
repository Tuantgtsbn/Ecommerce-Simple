const {ContactModel: Contact} = require("../../models/Contact");
const {cleanObject} = require("../../helpers/filter");

const submitContact = async (req, res) => {
  const {id: userId} = req.user;
  try {
    const data = cleanObject(req.body, [
      "username",
      "email",
      "phone",
      "message",
    ]);

    // Validate required fields
    if (!data.message) {
      return res.status(400).json({
        success: false,
        message: "Message is a required field",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const newContact = new Contact({
      userId,
      ...data,
    });

    await newContact.save();

    return res.status(200).json({
      success: true,
      message: "Contact submitted successfully. We will get back to you soon!",
      data: newContact,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

const getDetailContact = async (req, res) => {
  const {id: userId} = req.user;
  try {
    const {contactId} = req.params;
    const contact = await Contact.findOne({
      _id: contactId,
      userId,
    }).populate([
      {
        path: "userId",
        select: "username email",
      },
      {
        path: "response.respondedBy",
        select: "username email",
      },
    ]);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }
    const {userId: user, ...contactData} = contact.toObject();
    return res.status(200).json({
      success: true,
      data: {
        user,
        ...contactData,
      },
    });
  } catch (error) {
    console.error("Get contact status error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getUserContacts = async (req, res) => {
  try {
    const {id: userId} = req.user;
    const {page = 1, limit, isRead} = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }
    const filter = {userId};
    if (isRead !== undefined) {
      filter.isRead = isRead === "true";
    }
    const query = Contact.find(filter).sort({createdAt: -1});

    if (limit !== "all") {
      query.skip((page - 1) * (limit || 10)).limit(Number(limit || 10));
    }
    const contacts = await query.populate([
      {
        path: "userId",
        select: "username email",
      },
      {
        path: "response.respondedBy",
        select: "username email",
      },
    ]);

    const formatedContacts = contacts.map((contact) => {
      const {userId, ...contactData} = contact.toObject();
      return {user: userId, ...contactData};
    });

    const totalContacts = await Contact.countDocuments(filter);
    return res.status(200).json({
      success: true,
      data: formatedContacts,
      pagination: {
        page: limit === "all" ? 1 : Number(page),
        limit: limit || Number(limit || 10),
        totalItems: totalContacts,
        totalPages:
          limit === "all" ? 1 : Math.ceil(totalContacts / (limit || 10)),
      },
    });
  } catch (error) {
    console.error("Get user contacts error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  submitContact,
  getDetailContact,
  getUserContacts,
};
