const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { trimString } = require('../../functions/helpers/stringFormatters');
const UserReputation = require('../../models/userReputation');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('review')
		.setDescription('Adds a review to a user')
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
		.addUserOption((option) => option.setName('user').setDescription('The user to review').setRequired(true))
		.addStringOption((option) =>
			option
				.setName('affinity')
				.setDescription('The affinity of the review')
				.setRequired(true)
				.addChoices({ name: 'Positive', value: 'Positive' }, { name: 'Negative', value: 'Negative' })
		)
		.addStringOption((option) => option.setName('review').setDescription('The review').setRequired(true)),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction) {
		// Defer, things take time
		await interaction.deferReply();

		// Definitions
		const user = interaction.options.getUser('user');
		const affinity = interaction.options.getString('affinity');
		const review = interaction.options.getString('review');

		// Check for self review
		if (user.id === interaction.user.id) return interaction.followUp({ content: 'You cannot review yourself!', ephemeral: true });

		// Store the review and delete the oldest one if there are more than 5
		await UserReputation.findOneAndUpdate(
			{ userId: user.id },
			{
				$push: {
					userReviews: {
						affinity: affinity,
						review: review,
						reviewer: interaction.user.id,
						timestamp: Date.now(),
					},
				},
				$inc: { userRep: affinity === 'Positive' ? 1 : -1 },
			},
			{ upsert: true, new: true }
		);

		// Get the total reviews for the user
		const userReputation = await UserReputation.findOne({ userId: user.id });
		const totalReviews = userReputation.userReviews.length;
		const userRep = userReputation.userRep;

		// Build an embed to tell the user they were reviewed
		const embed = new EmbedBuilder()
			.setTitle('User Review')
			.setColor(client.color)
			.setThumbnail(user.displayAvatarURL())
			.setDescription(`Hey, ${user}\nYou have been reviewed by ${interaction.user}!\n\n**__[Here is the review]__**\n${trimString(review, 800)}\n`)
			.setFooter({ text: `Affinity: ${affinity} | Total Reviews: ${totalReviews} | User Rep: ${userRep}` })
			.setTimestamp();

		// Send the embed
		await interaction.followUp({ embeds: [embed] });
	},
};
