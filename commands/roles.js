const { SlashCommandBuilder, ComponentType, SelectMenuOptionBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, ButtonBuilder } = require("discord.js");
const { customRoles } = require("../config.json");

module.exports =
{
	data: new SlashCommandBuilder()
		.setName("roles")
		.setDescription("Lets you add/remove roles to yourself for viewing specific channels"),
	async execute(interaction)
	{
		const member = interaction.member;
		const guild = interaction.guild;
		await interaction.reply({ content: "Select the role you would like to add or remove:", ephemeral: true, components: [createMenu(-1, member), createButtons(false, false)] });
		const message = await interaction.fetchReply();
		const collector = message.createMessageComponentCollector({ time: 900000 });
		let newRole;
		collector.on("collect", i =>
		{
			const userRoles = guild.members.cache.get(`${i.user.id}`).roles;
			if (i.componentType === ComponentType.SelectMenu)
			{
				for (const role of interaction.guild.roles.cache)
				{
					if (role[0] == i.values[0])
					{
						newRole = role;
						let found = false;
						for (const userRole of userRoles.cache)
						{
							if (userRole[0] === i.values[0])
							{
								i.update({ content: "Select the role you would like to add or remove:", ephemeral: true, components: [createMenu(i.values[0], member), createButtons(false, true)] });
								found = true;
								break;
							}
						}
						if (!found)
						{
							i.update({ content: "Select the role you would like to add or remove:", ephemeral: true, components: [createMenu(i.values[0], member), createButtons(true, false)] });
						}
						break;
					}
				}
			}
			else if (i.componentType === ComponentType.Button)
			{
				switch (i.customId)
				{
					case "buttonAdd":
						userRoles.add(newRole);
						i.update({ content: `Sucessfully added the "${newRole[1].name}" role. You can either dismiss this message, or hit the button below to start again.`, ephemeral: true, components: [createSingleButton()] });
						break;
					case "buttonRemove":
						userRoles.remove(newRole);
						i.update({ content: `Sucessfully removed the "${newRole[1].name}" role. You can either dismiss this message, or hit the button below to start again.`, ephemeral: true, components: [createSingleButton()] });
						break;
					case "buttonCancel":
						i.update({ content: "Sounds good! You can either dismiss this message, or hit the button below to start again.", ephemeral: true, components: [createSingleButton()] });
						break;
					case "buttonReturn":
						i.update({ content: "Select the role you would like to add or remove:", ephemeral: true, components: [createMenu(-1, interaction.member), createButtons(false, false)] });
						break;
				}
			}
		});
	},
};

/**
 * Helper function that creates a select menu.
 * @param {int} itemSelected An int describing which menu item was selected; -1 for none.
 * @param {GuildMember} member The GuildMember that triggered this menu.
 * @returns action row containing a single select menu for roles.
 */
function createMenu(itemSelected, member)
{
	const selectMenuBuilder = new SelectMenuBuilder()
		.setCustomId("roleSelect")
		.setPlaceholder("No role selected.");

	const options = Array();
	for (const role of customRoles)
	{
		options.push(new SelectMenuOptionBuilder()
			.setLabel(role.name)
			.setDescription(doesMemberHaveRole(member, role.id) ? "✔ You currently have this role" : " ")
			.setValue(role.id)
			.setEmoji(role.emoji === "" ? {} : { name: role.emoji })
			.setDefault(itemSelected === role.id),
		);
	}

	return new ActionRowBuilder().addComponents(selectMenuBuilder.setOptions(options));
}

/**
 * A helper function to determine if a GuildMember has a certain Role.
 * @param {GuildMember} member The GuildMember to check.
 * @param {Role} role The Role to check if the GuildMember has.
 * @returns true if the GuildMember has the role; false otherwise.
 */
function doesMemberHaveRole(member, role)
{
	for (const memberRole of member.roles.cache)
	{
		if (role === memberRole[0])
		{
			return true;
		}
	}
	return false;
}

/**
 * Helper function that creates an action row of three buttons.
 * @param {bool} isAdd Whether the "Add" button should be enabled or not.
 * @param {bool} isRemove Whether the "Remove" button should be enabled or not.
 * @returns action row containing the buttons "Add", "Remove", and "Cancel".
 */
function createButtons(isAdd, isRemove)
{
	return new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId("buttonAdd")
				.setLabel("Add")
				.setStyle(ButtonStyle.Primary)
				.setDisabled(!isAdd),
			new ButtonBuilder()
				.setCustomId("buttonRemove")
				.setLabel("Remove")
				.setStyle(ButtonStyle.Danger)
				.setDisabled(!isRemove),
			new ButtonBuilder()
				.setCustomId("buttonCancel")
				.setLabel("Cancel")
				.setStyle(ButtonStyle.Secondary),
		);
}

/**
 * Helper function that creates a single "Start Over" button.
 * @returns action row containing a single "Start Over" button.
 */
function createSingleButton()
{
	return new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId("buttonReturn")
				.setLabel("Start Over")
				.setStyle(ButtonStyle.Primary),
		);
}