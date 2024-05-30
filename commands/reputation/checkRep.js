const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { reputationToString } = require('../../functions/helpers/stringFormatters');
const UserReputation = require('../../models/userReputation');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reputation')
		.setDescription('Check the reputation of a user or yourself')
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
		.addUserOption((option) => option.setName('user').setDescription('The user to check the reputation of.').setRequired(false)),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction) {
		// Defer, things take time
		await interaction.deferReply();

		// Definitions
		const user = interaction.options.getUser('user') || interaction.user;
		const member = interaction.guild.members.cache.get(user.id);
		if (!member) return interaction.followUp({ content: 'Unable to retrieve user...', ephemeral: true });

		// Get the user's reputation
		const userReputation = await UserReputation.findOne({ userId: member.id });
		if (!userReputation) return interaction.followUp({ content: 'This user has no reputation yet.', ephemeral: true });

		// Get the total reviews and reputation for the user
		const totalReviews = userReputation.userReviews.length;
		const userRep = userReputation.userRep;

		// Build an embed to show the user's reputation
		const embed = new EmbedBuilder()
			.setTitle(`${member.displayName}'s Reputation`)
			.setColor(client.color)
			.setThumbnail(member.displayAvatarURL())
			.setDescription(`**[Reputation]**\n${reputationToString(userRep)} (${userRep})\n\n**Total Reviews)** ${totalReviews}`)
			.setTimestamp();

		// Send the embed
		return interaction.followUp({ embeds: [embed] });
	},
};
