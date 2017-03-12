const winston = require('winston');
const dateFormat = require('dateformat');
const chalk = require('chalk');

const colors = {
    INFO: chalk.green,
    ERROR: chalk.red,
    DEBUG: chalk.yellow,
    WARN: chalk.magenta
};

const getColor = (type)=> colors[type.toUpperCase()] || chalk.white;

class Logger extends winston.Logger{
    constructor(prefix){
        super({
            colorize: false,
            transports:[
                new (winston.transports.File)({ filename: (prefix||'frozor')+'-logger.log' }),
                new (winston.transports.Console)({
                    timestamp: ()=> dateFormat(new Date(), 'mm/dd/yyyy HH:MM:ss'),
                    formatter: (opt)=> `${chalk.white(`[${opt.timestamp()}]`)} ${getColor(opt.level)(`${(opt.meta.prefix)?`[${(prefix)?`${prefix}|${opt.meta.prefix}`:opt.meta.prefix}] `:(prefix)?`[${prefix}] ` : ''}`)}${getColor(opt.level).bold(`${opt.level.toUpperCase()}`)}${chalk.white(`: ${opt.message}`)}`
                })
            ]
        });

        this.warning = this.warn;
    }

    log(level, message, prefix){
        super.log(level, message, {
            prefix: prefix
        });
    }
}

module.exports = Logger;