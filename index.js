const fs = require('fs');
const winston = require('winston');
const dateFormat = require('dateformat');
const chalk = require('chalk');

const colors = {
    INFO: chalk.green,
    ERROR: chalk.red,
    DEBUG: chalk.yellow,
    WARN: chalk.magenta,
    COMMAND: chalk.cyan
};

const getColor = (type)=> colors[type.toUpperCase()] || chalk.white;
const getTimestamp = ()=> dateFormat(new Date(), 'mm/dd/yyyy HH:MM:ss');
const messageFormatter = (opt, prefix)=> `${chalk.white(`[${opt.timestamp()}]`)} ${getColor(opt.level)(`${(opt.meta.prefix)?`[${(prefix)?`${prefix}|${opt.meta.prefix}`:opt.meta.prefix}] `:(prefix)?`[${prefix}] ` : ''}`)}${getColor(opt.level).bold(`${opt.level.toUpperCase()}`)}${chalk.white(`: ${opt.message}`)}`;
const getLevel = ()=> process.env.NODE_ENV == 'dev' ? 'debug' : 'info';

class Logger extends winston.Logger{
    constructor(prefix, filename){
        super({
            colorize: false,
            transports:[
                new (winston.transports.File)({ filename: 'logs/'+(filename||prefix||'frozor')+'-logger.log', formatter: (opt)=> chalk.stripColor(opt.message), level: getLevel()}),
                new (winston.transports.Console)({
                    levels: { error: 0, warn: 1, command: 2, info: 3, verbose: 4, debug: 5, silly: 6 },
                    timestamp: getTimestamp,
                    formatter: (opt)=>{
                        if(opt.meta.overrideLevel){
                            opt.level = opt.meta.overrideLevel;
                        }
                        return messageFormatter(opt, prefix);
                    },
                    level: getLevel()
                })
            ]
        });

        if(!fs.existsSync('./logs')){
            fs.mkdirSync('./logs');
        }

        this.prefix = prefix;

        this.exitOnError = false;

        this.warning = this.warn;

        this.chalk = chalk;
    }

    log(level, message, prefix, meta = {}){
        super.log(level, message, Object.assign({
            prefix: prefix
        }, meta));
    }

    command(name, cmd, type, success){
        super.log('info', `${chalk.cyan(name)} executed ${chalk.cyan(type)} command ${chalk.magenta(cmd)} ${(success)?chalk.green('Successfuly'):chalk.red('Unsuccessfully')}`, {
            overrideLevel: 'command'
        });
        return this;
    }
}

module.exports = Logger;