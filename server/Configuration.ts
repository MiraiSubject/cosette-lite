import { ITournamentConfig } from './config.interface';
import config from '../config.json';
import { singleton } from 'tsyringe';

@singleton()
export default class Configuration {
    public readonly config: ITournamentConfig;
    constructor() {
        this.config = config;
    }
}
