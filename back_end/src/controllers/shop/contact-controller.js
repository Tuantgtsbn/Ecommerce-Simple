const {ContactModel: Contact} = require("../../models/Contact");

const submitContact = async (req, res) => {
  try {
    const {name, email, phone, subject, message, userId} = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required fields",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Check if user has submitted too many contacts recently (spam protection)
    if (email) {
      const recentContacts = await Contact.countDocuments({
        email,
        createdAt: {$gte: new Date(Date.now() - 24 * 60 * 60 * 1000)}, // Last 24 hours
      });

      if (recentContacts >= 3) {
        return res.status(429).json({
          success: false,
          message: "Too many contact submissions. Please try again later.",
        });
      }
    }

    const newContact = new Contact({
      name,
      email,
      phone: phone || null,
      subject: subject || "General Inquiry",
      message,
      userId: userId || null,
      status: "pending",
    });

    await newContact.save();

    return res.status(200).json({
      success: true,
      message: "Contact submitted successfully. We will get back to you soon!",
      data: {
        id: newContact._id,
        submittedAt: newContact.createdAt,
      },
    });
  } catch (error) {
    console.error("Submit contact error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

const getContactStatus = async (req, res) => {
  try {
    const {contactId} = req.params;

    const contact = await Contact.findById(contactId).select(
      "status response createdAt updatedAt",
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: contact,
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
    const {userId} = req.params;
    const {page = 1, limit = 10} = req.query;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const contacts = await Contact.find({userId})
      .sort({createdAt: -1})
      .skip(skip)
      .limit(Number(limit));

    const totalContacts = await Contact.countDocuments({userId});

    return res.status(200).json({
      success: true,
      data: contacts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalContacts,
        pages: Math.ceil(totalContacts / limit),
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
  getContactStatus,
  getUserContacts,
};
