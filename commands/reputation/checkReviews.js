const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { dateToLongDate } = require('../../functions/helpers/dateFormatters');
const { trimString, reputationToString } = require('../../functions/helpers/stringFormatters');
const UserReputation = require('../../models/userReputation');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reviews')
		.setDescription('Check the reviews of a user or yourself')
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
		.addUserOption((option) => option.setName('user').setDescription('The user to check the reviews for.').setRequired(false)),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction) {
		// Defer, things take time
		await interaction.deferReply();

		// Definitions
		let reviewEmbed;
		const user = interaction.options.getUser('user') || interaction.user;
		const member = interaction.guild.members.cache.get(user.id);
		if (!member) return interaction.followUp({ content: 'Unable to retrieve user...', ephemeral: true });

		// Get the user's reputation
		const userReputation = await UserReputation.findOne({ userId: member.id });
		if (!userReputation?.userReviews.length) return interaction.followUp({ content: 'This user has no reviews yet.', ephemeral: true });

		// Get the user's reputation level
		const reputationLevel = reputationToString(userReputation.userRep);

		// Segment the reviews into chunks of 5
		const reviewChunks = [];
		for (let i = 0; i < userReputation.userReviews.length; i += 5) {
			reviewChunks.push(userReputation.userReviews.slice(i, i + 5));
		}

		// Loop through the review chunks and build the embeds
		const embeds = [];
		for (const reviews of reviewChunks) {
			// Format the reviews
			const formattedReviews = reviews.map((data, index) => {
				return `__\`[Review ${index + 1}]\`__\n**Reviewer)** <@${data.reviewer}>\n**Affinity)** ${data.affinity}\n**Timestamp)** ${dateToLongDate(
					data.timestamp
				)}\n**Review)**\n${trimString(data.review, 150)}`;
			});

			const embed = new EmbedBuilder()
				.setTitle(`${member.displayName}`)
				.setColor(client.color)
				.setThumbnail(member.displayAvatarURL())
				.setDescription(`**${reputationLevel}**\n\n${formattedReviews.join('\n\n')}`)
				.setFooter({ text: `Page ${embeds.length + 1} of ${reviewChunks.length}` })
				.setTimestamp();
			embeds.push(embed);
		}

		// If there are multiple pages, create some buttons for pagination
		if (embeds.length > 1) {
			// Build the buttons
			const messageButtons = new ActionRowBuilder().addComponents(
				new ButtonBuilder().setCustomId('previous').setLabel('Previous').setStyle(ButtonStyle.Success),
				new ButtonBuilder().setCustomId('cancel').setLabel('Cancel').setStyle(ButtonStyle.Danger),
				new ButtonBuilder().setCustomId('next').setLabel('Next').setStyle(ButtonStyle.Success)
			);

			// Send the first embed with buttons
			reviewEmbed = await interaction.followUp({ embeds: [embeds[0]], components: [messageButtons], fetchReply: true });
		} else {
			// If there is only one page, send the embed
			reviewEmbed = await interaction.followUp({ embeds: [embeds[0]], fetchReply: true });
		}

		// Define the collector
		const filter = (buttonInt) => buttonInt.user.id === interaction.user.id;
		const collector = reviewEmbed.createMessageComponentCollector({ filter, time: 60000 });

		// Pagination
		let currentPage = 0;
		collector.on('collect', async (buttonInt) => {
			// Defer the button interaction
			await buttonInt.deferUpdate();

			// Handle the button interactions
			switch (buttonInt.customId) {
				case 'previous':
					if (currentPage > 0) {
						currentPage--;
						await interaction.editReply({ embeds: [embeds[currentPage]] });
					}
					break;
				case 'next':
					if (currentPage < embeds.length - 1) {
						currentPage++;
						await interaction.editReply({ embeds: [embeds[currentPage]] });
					}
					break;
				case 'cancel':
					await interaction.editReply({ components: [] });
					return collector.stop();
			}
		});
	},
};
