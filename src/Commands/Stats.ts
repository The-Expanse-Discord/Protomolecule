import { Command } from '../Infrastructure/System/Command';
import { Message, Guild, GuildMember, MessageEmbed, Role, Collection } from 'discord.js';
import moment = require('moment');

/**
 * ## Stats
 * Display user Discord stats.
 *
 * Usage:
 * `.stats`
 * `.stats <discord ID/mention>`
 *
 * @category Commands: Misc
 */
export default class Stats extends Command {
	public constructor() {
		super({
			name: 'Discord Stats',
			command: [ 'stats' ],
			description: 'Display user Discord stats.',
			argumentDescriptions: [],
			usage: '<prefix>stats <Argument>?',
			roles: [],
			commandsPerMinute: 5,
			commandSurgeMax: 2.0,
		});
	}

	public async execute(message: Message, args: string[]): Promise<void> {
		const guild: Guild | undefined = this.client.guilds.cache.get('529310206639996928');
		let guildMember: GuildMember | undefined | null = null;

		if (guild && args.length > 0) {
			if (guild.members.fetch(args[0])) {
				guildMember = await guild.members.fetch(args[0]);
			}
		} else if (guild) {
			guildMember = message.member;
		} else {
			return;
		}

		if (guildMember) {
			const joinDiscord: string = `${ moment(guildMember.user.createdAt).format('lll') }\n` +
				`*about ${ moment(guildMember.user.createdAt).fromNow() }*`;
			const joinServer: string = `${ moment(guildMember.joinedAt).format('lll') }\n` +
				`*about ${ moment(guildMember.joinedAt).fromNow() }*`;
			const memberRoles: Collection<string, Role> = new Collection(
				Array.from(guildMember.roles.cache.entries())
			)
				.sort((a: Role, b: Role) => b.position - a.position);

			const roles: Role[] = [];
			let rolesString: string = '*none*';
			let status: string = guildMember.presence.status;

			// iterate through user roles
			memberRoles.forEach((el: Role) => {
				if (el.name !== '@everyone') {
					roles.push(el);
				}
			});

			// make sure roles isn't empty
			if (roles.length > 0) {
				rolesString = roles.join(', ');
			}

			// update status string, based on original status
			if (status === 'dnd') {
				status = 'Do Not Disturb';
			} else {
				status = `${ status.charAt(0).toUpperCase() + status.slice(1) }`;
			}

			// build the embed
			const embed: MessageEmbed = (new MessageEmbed)
				.setColor(0x206694)
				.setAuthor(`${ guildMember.user.username }#${ guildMember.user.discriminator }`)
				.setThumbnail(guildMember.user.displayAvatarURL())
				.addField('Joined Server', joinServer, true)
				.addField('Joined Discord', joinDiscord, true)
				.addField('Roles', rolesString, false)
				.setFooter(status);

			// display stats
			message.channel.send(embed);
		}
	}
}
