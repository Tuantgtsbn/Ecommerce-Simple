const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AddressSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address: {
        type: String,
        required: true
    },
    street: {
        type: String
    },
    ward: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    notes: {
        type: String
    }
});
const AddressModel = mongoose.model('Address', AddressSchema);
module.exports = AddressModel;
