import * as fs from 'fs';
import * as JSON5 from 'json5';
import Configuration from '../System/Configuration';

/** @internal */
const rawConfig: string = fs.readFileSync('./config.json5' as string, 'utf8');

/** @internal */
const configDiscordClient: Configuration = new Configuration(JSON5.parse(rawConfig));

export { configDiscordClient };
