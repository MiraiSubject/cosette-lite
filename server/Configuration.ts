import { singleton } from 'tsyringe';
import config from '../config.json';
import { ITournamentConfig } from './config.interface';

@singleton()
export default class Configuration {
    public readonly config: ITournamentConfig;
    constructor() {
        this.config = config;
    }
}
