import { ActivityType, Client, ClientOptions } from 'discord.js';
import { CommandHandler, EstablishedMemberHandler, RoleHandler, AmaHandler } from '../Handlers';
import { configDiscordClient } from './Config';
import APoD from '../../Commands/APoD';
import XKCD from '../../Commands/XKCD';
import Avasarala from '../../Commands/Avasarala';
import Miller from '../../Commands/Miller';
import Stats from '../../Commands/Stats';
import logger from '../../Utils/logger';

/**
 * ## Rocinante
 * The heart of the Rocinante.
 *
 * @category System
 */
export default class Rocinante extends Client {
	public readonly prefix: string;
	private ready: boolean;
	private lastSigint: number = 0;

	public statusType: ActivityType;
	public statusText: string;

	public commandHandler: CommandHandler;
	public readonly roleManager: RoleHandler;
	public readonly establishedMemberHandler: EstablishedMemberHandler;
	public readonly amaHandler: AmaHandler;

	public constructor(clientOptions?: ClientOptions) {
		super(clientOptions);

		this.token = configDiscordClient.token;

		this.prefix = configDiscordClient.commandPrefix;

		this.statusType = configDiscordClient.statusType as ActivityType;
		this.statusText = configDiscordClient.statusText;

		this.commandHandler = new CommandHandler(this,
			configDiscordClient.unlimitedRoles,
			configDiscordClient.commandChannels);
		this.roleManager = new RoleHandler(
			this,
			configDiscordClient.welcomeChannels,
			configDiscordClient.moderatorUserId
		);
		this.establishedMemberHandler = new EstablishedMemberHandler(
			this,
			configDiscordClient.establishedMemberJsonFile,
			configDiscordClient.establishedMemberRole,
			configDiscordClient.establishedMemberExcludedCategories,
			configDiscordClient.guild
		);
		this.amaHandler = new AmaHandler(
			this,
			configDiscordClient.amaChannel
		);

		this.ready = false;
	}

	public isReady() : boolean {
		return this.ready;
	}

	public async start(): Promise<void> {
		await this.init();
	}

	private async shutdown(): Promise<void> {
		await this.establishedMemberHandler.shutdown();
		this.destroy();
	}

	private async init(): Promise<void> {
		this.once('ready', async() => {
			/*
			 * This needs to be initialized after we have loaded all the cached things,
			 * which happens after ready, not login.
			 */
			if (this.user) {
				await this.user.setActivity(this.statusText, { type: this.statusType });
			}

			await this.roleManager.init();
			await this.establishedMemberHandler.init();
			this.commandHandler.init([ APoD, XKCD, Avasarala, Miller, Stats ]);
			this.amaHandler.init();

			logger.info('The Rocinante is Ready');
			this.ready = true;
		});

		this.on('disconnect', () => {
			this.shutdown();
		});

		if (this.token) {
			await this.login(this.token);

			logger.info('Logged in');
		} else {
			logger.info('No token present');
		}

		process.on('SIGINT', () => {
			logger.info('Caught interrupt signal');
			if (this.lastSigint === 0 || Date.now() - this.lastSigint < 100) {
				this.lastSigint = Date.now();
				this.shutdown();
			} else {
				process.exit(100);
			}
		});
	}
}
