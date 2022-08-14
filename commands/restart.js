const { SlashCommandBuilder } = require("discord.js");

module.exports =
{
	data: new SlashCommandBuilder()
		.setName("restart")
		.setDescription("Restarts/updates the bot"),
	async execute(interaction)
	{
		await interaction.reply({ content: "Brb!", ephemeral: true });
		process.exit(0);
	},
};