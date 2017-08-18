const fs = require('fs');
const winston = require('winston');
const dateFormat = require('dateformat');
const chalk = require('chalk');
const sanitizeFileName = require('sanitize-filename');

const colors = {
    INFO: chalk.green,
    ERROR: chalk.red,
    DEBUG: chalk.yellow,
    WARN: chalk.magenta,
    COMMAND: chalk.cyan,
    get: c => colors[c.toUpperCase()] || chalk.white
};

function getTimestamp () {
    return dateFormat(new Date(), 'mm/dd/yyyy HH:MM:ss');
}

// jesus have mercy
const messageFormatter = (opt, prefix)=> `${chalk.white(`[${opt.timestamp()}]`)} ${colors.get(opt.level)(`${(opt.meta.prefix)?`[${(prefix)?`${prefix}|${opt.meta.prefix}`:opt.meta.prefix}] `:(prefix)?`[${prefix}] ` : ''}`)}${colors.get(opt.level).bold(`${opt.level.toUpperCase()}`)}${chalk.white(`: ${opt.message}`)}`;

function getLogLevel() {
    return process.env.NODE_ENV === 'dev' ? 'debug' : 'info';
}

const LOG_LEVEL = process.env.NODE_ENV === 'dev' ? 'debug' : 'info';

class Logger extends winston.Logger{
    constructor(prefix, filename){
        super({
            colorize: false,
            transports:[
                new (winston.transports.File)({ filename: `logs/${sanitizeFileName(filename || prefix ||'frozor')}-logger.log`, formatter: (opt)=> chalk.stripColor(opt.message), level: LOG_LEVEL}),
                new (winston.transports.Console)({
                    levels: { error: 0, warn: 1, command: 2, info: 3, verbose: 4, debug: 5, silly: 6 },
                    timestamp: getTimestamp,
                    formatter: (opt)=>{
                        if(opt.meta.overrideLevel){
                            opt.level = opt.meta.overrideLevel;
                        }
                        return messageFormatter(opt, prefix);
                    },
                    level: LOG_LEVEL
                })
            ]
        });

        if(!fs.existsSync('./logs')){
            fs.mkdirSync('./logs');
        }

        this.prefix = prefix;

        this.exitOnError = false;

        this.warning = this.warn;

        /**
         * Literally the npm module chalk.
         * @type {object}
         */
        this.chalk = chalk;

        /**
         * @name Logger#info
         * @function
         * @memberOf Logger
         * @description Log a message with the 'INFO' prefix, and log level 'info'
         * @param {string} message - The message to log
         * @param {string} [prefix] - The prefix to include in the log
         */
        /**
         * @name Logger#error
         * @function
         * @memberOf Logger
         * @description Log a message with the 'ERROR' prefix, and log level 'error'
         * @param {string} message - The message to log
         * @param {string} [prefix] - The prefix to include in the log
         */
        /**
         * @name Logger#warn
         * @function
         * @memberOf Logger
         * @description Log a message with the 'WARN' prefix, and log level 'warn'
         * @param {string} message - The message to log
         * @param {string} [prefix] - The prefix to include in the log
         */
        /**
         * @name Logger#debug
         * @function
         * @memberOf Logger
         * @description Log a message with the 'DEBUG' prefix, and log level 'debug'. Set NODE_ENV=dev to see these without setting levels.
         * @param {string} message - The message to log
         * @param {string} [prefix] - The prefix to include in the log
         */
        /**
         * @name Logger#command
         * @function
         * @memberOf Logger
         * @description Log a command's use to the console.
         * @param {string} name - The name of the user that executed the command.
         * @param {string} cmd - The name of the command that was executed (or the full text, if you want)
         * @param {string} type - The command type. For instance, slack bots may want to use "Slack" as the type.
         * @param {boolean} success
         */
    }

    log(level, message, prefix, meta = {}){
        super.log(level, message, Object.assign({ prefix }, meta));
    }

    command(name, cmd, type, success = true){
        super.log('info', `${chalk.cyan(name)} executed ${chalk.cyan(type)} command ${chalk.magenta(cmd)} ${(success) ? chalk.green('Successfuly') : chalk.red('Unsuccessfully')}`, {
            overrideLevel: 'command'
        });
        return this;
    }
}

Logger.chalk = chalk;

module.exports = Logger;