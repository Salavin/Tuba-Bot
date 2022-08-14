const { SlashCommandBuilder, Routes } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { clientId, guildId, token } = require("./config.json");

const commands =
[
	new SlashCommandBuilder()
		.setName("roles")
		.setDescription("Lets you add/remove roles to yourself for viewing specific channels"),
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log("Successfully registered application commands."))
	.catch(console.error);