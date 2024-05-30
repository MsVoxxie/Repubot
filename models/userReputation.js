const { Schema, model } = require('mongoose');

const userReputationSchema = new Schema({
	userId: { type: String, required: true },
	userRep: { type: Number, default: 0 },
	userReviews: { type: Array, default: [] },
});

module.exports = model('UserReputation', userReputationSchema);
