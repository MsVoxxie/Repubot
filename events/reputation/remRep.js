const { Events } = require('discord.js');
const UserReputation = require('../../models/userReputation');

module.exports = {
	name: Events.MessageReactionAdd,
	runType: 'infinity',
	async execute(client, reaction, reactor) {
		// Ignore bots
		if (reactor.bot) return;

		// Fetch partials
		if (reaction.message.partial) await reaction.message.fetch();

		// Check for correct reaction
		if (reaction.emoji.name !== '📉') return;

		// Definitions
		const message = reaction.message;

		// +1 Reputation
		const userReputation = await UserReputation.findOneAndUpdate({ userId: message.author.id }, { $inc: { userRep: -1 } }, { upsert: true, new: true });
	},
};
