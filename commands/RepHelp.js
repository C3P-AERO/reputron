let Command = require('yamdbf').Command;
let padRight = function(text, len)
{
	return text + ' '.repeat(len - text.length);
}

exports.default = class RepHelp extends Command
{
    constructor(bot)
    {
		super(bot, {
			name: '??help',
			description: 'Provides information on Reputron commands',
			aliases: ['rephelp'],
			usage: `??help [command]`,
			extraHelp: 'Will DM Reputron command help information to the user to keep clutter down in guild channels. If you use the help command from within a DM you will only receive information for the commands you can use within the DM. If you want help with commands usable in a guild, call the help command in a guild channel. You will receive a list of the commands that you have permissions/roles for in that channel.',
			group: 'base',
			overloads: 'help'
		});
    }

    action(message, args, mentions, original) // eslint-disable-line no-unused-vars
    {
		try
		{
			let dm = message.channel.type === 'dm';
			if (this.bot.selfbot) message.delete();

			let command;
			let output = '';
			if (!args[0] && !dm)
			{
				command = true;
				output += `These are the commands available to you in the channel you requested help:\n\`\`\`ldif\n`;
				let usableCommands = this.bot.commands
					.filterGuildUsable(this.bot, message);
				let widest = usableCommands.map(c => c.name.length).reduce((a, b) => Math.max(a, b));
				output += usableCommands.map(c =>
					`${padRight(c.name, widest + 1)}: ${c.description}`).join('\n');
				output += `\`\`\`Use "??help <command>" or "${this.bot.user} ??help <command>" for more information.\n\n`;
			}
			else if (!args[0] && dm)
			{
				command = true;
				output += `These are the commands available to you within this DM:\n\`\`\`ldif\n`;
				let usableCommands = this.bot.commands
					.filterDMUsable(this.bot, message);
				let widest = usableCommands.map(c => c.name.length).reduce((a, b) => Math.max(a, b));
				output += usableCommands.map(c =>
					`${padRight(c.name, widest + 1)}: ${c.description}`).join('\n');
				output += `\`\`\`Use "??help <command>" or "${this.bot.user} ??help <command>" for more information.\n\n`;
			}
			else if (args[0])
			{
				if (!dm)
				{
					command = this.bot.commands
						.filterGuildUsable(this.bot, message)
						.filter(c => c.name === args[0]
							|| c.aliases.includes(args[0])).first();
				}
				else
				{
					command = this.bot.commands
						.filterDMHelp(this.bot, message)
						.filter(c => c.name === args[0]
							|| c.aliases.includes(args[0])).first();
				}
				if (!command)
				{
					output += `A command by that name could not be found or you do not have permissions to view it in this guild or channel`;
				}
				else
				{
					output += '```ldif\n' // eslint-disable-line prefer-template
						+ `Command: ${command.name}\n`
						+ `Description: ${command.description}\n`
						+ (command.aliases.length > 0 ? `Aliases: ${command.aliases.join(', ')}\n` : '')
						+ `Usage: ${command.usage}\n`
						+ (command.extraHelp ? `\n${command.extraHelp}` : '')
						+ '\n```';
				}
			}
			output = dm ? output.replace(/<prefix>/g, '')
				: output.replace(/<prefix>/g, this.bot.getPrefix(message.guild) || '');

			if (!dm && !this.bot.selfbot && command) message.reply(`Sent you a DM with help information.`)
				.then(response =>
				{
					response.delete(5 * 1000);
				});
			if (!dm && !this.bot.selfbot && !command) message.reply(`Sent you a DM with information.`)
				.then(response =>
				{
					response.delete(5 * 1000);
				});
			if (this.bot.selfbot) message.channel.sendMessage(output);
			else message.author.sendMessage(output);
		}
		catch (err)
		{
			console.log(err);
		}
    }
};
