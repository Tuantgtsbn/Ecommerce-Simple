const {mongoose} = require("../config/db");
const Schema = mongoose.Schema;

const SessionSchema = new Schema({
  sessionId: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

SessionSchema.index({expiresAt: 1}, {expireAfterSeconds: 0});

const SessionModel = mongoose.model("Session", SessionSchema);

module.exports = {SessionModel};
