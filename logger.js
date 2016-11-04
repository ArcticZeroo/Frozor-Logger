var chalk          = require('chalk');
var fs             = require('fs');

var log_level = 0;
class Logger{
    constructor(globalPrefix){
        this.chalk  = chalk;

        this.local_log_level = null;
        this.log_levels      = ["ALL", "DEBUG", "GWEN", "COMMAND", "INFO", "WARNING", "ERROR", "NONE"];
        this.fileNames       = {
            OUTPUT:  `${__dirname}/output.log`,
            DEBUG:   `${__dirname}/debug.log`,
            ERROR:   `${__dirname}/error.log`,
            COMMAND: `${__dirname}/command.log`,
            GWEN:    `${__dirname}/gwen.log`
        };

        this.writeStreams     = {};

        this.streamOpenedHandler = function(file){
            this.writeStreams[file].stream.on('open', ()=>{
                this.writeStreams[file].opened = true;
                if(this.writeStreams[file].queue.length > 0){
                    this.writeStreams[file].stream.write(chalk.stripColor(this.writeStreams[file].queue.join('')));
                    delete this.writeStreams[file].queue;
                }
            });
        };

        for(var fileType in this.fileNames){
            var filePath = this.fileNames[fileType];
            this.writeStreams[filePath] = {
                opened: false,
                stream: fs.createWriteStream(filePath, {flags: 'a+'}),
                queue : []
            };
            this.streamOpenedHandler(filePath);
        }

        this.prefix = globalPrefix;

        //legacy methods in case I forget to convert -- for old projects
        this.logInfo    = this.info;
        this.logDebug   = this.debug;
        this.logError   = this.error;
        this.logCommand = this.command;
        this.logGwen    = this.gwen;
        this.logWarning = this.warning;
    }

    setLogLevel(new_level){
        log_level = (this.log_levels.indexOf(new_level.toUpperCase()));
    }

    getLogLevel(){
        return this.log_levels[log_level];
    }

    getLogLevelInt(){
        return log_level;
    }

    setLocalLogLevel(new_level){
        this.local_log_level = (this.log_levels.indexOf(new_level.toUpperCase()));
    }

    getLocalLogLevel(){
        if(!this.local_log_level) return null;
        return this.log_levels[this.local_log_level];
    }

    getLocalLogLevelInt(){
        return this.local_log_level;
    }


    canLog(level){
        //console.log(`${level} ${this.log_levels.indexOf(level)} ${this.getLogLevelInt()} ${log_level}`);
        return ((this.local_log_level) ? this.log_levels.indexOf(level) >= this.getLocalLogLevelInt() : this.log_levels.indexOf(level) >= this.getLogLevelInt());
    }

    getPrefix(){
        return this.prefix;
    }

    setPrefix(prefix){
        this.prefix = prefix;
    }

    static getConsoleTimestamp(){
        var date = new Date();
        var minutes = date.getMinutes();
        var hours = date.getHours();
        var seconds = date.getSeconds();
        var month = parseInt(date.getMonth())+1;
        if(minutes < 10){
            minutes = "0" + minutes;
        }
        if(hours < 10){
            hours = "0" + hours;
        }
        if(seconds < 10){
            seconds = "0" + seconds;
        }

        var timestamp = "[" + month + "/" + date.getDate() + "/" + date.getFullYear() + " " + hours + ":" + minutes + ":" + seconds + "]";
        return timestamp + " ";
    }

    log(message, save, file){
        try{
            save = save || false;
            file = file || this.fileNames.OUTPUT;
            var toLog = `${chalk.bold(Logger.getConsoleTimestamp())}${message}`;
            try{
                process.stdout.write(`${toLog}\n`);
            }catch(e){
                //Don't do anything with e because if it can't console log then we are doomed anyways
            }

            if(save) {
                if(!this.writeStreams[file].opened) return this.writeStreams[file].queue.push(`\r\n${chalk.stripColor(toLog)}`);
                this.writeStreams[file].stream.write(`\r\n${chalk.stripColor(toLog)}`);
            }
        }catch(e){}
    }

    getLogPrefix(prefix){
        let globalPrefix = this.getPrefix();
        if(!prefix && !globalPrefix) return null;
        return `[${(globalPrefix) ? ((prefix) ? `${globalPrefix}|` : globalPrefix) : ``}${(prefix) ? `${prefix}` : ``}]`;
    }

    static getLogTypeString(color, type){
        return `${color(chalk.bold(type))}:`;
    }

    getLogStart(color, type, prefix){
        var logPrefix = this.getLogPrefix(prefix);
        return `${(logPrefix) ? `${color(logPrefix)} ` : ``}${Logger.getLogTypeString(color, type)}`;
    }

    getLogMessage(color, type, message, prefix){
        return `${this.getLogStart(color, type, prefix)} ${message}`;
    }

    error(message, prefix){
        var level         = "ERROR";
        if(!this.canLog(level)) return;

        try{
            prefix = prefix || false;
            this.log(this.getLogMessage(chalk.red, "ERROR", message, prefix), true, this.fileNames.ERROR);
        }catch(e){
            this.log(this.getLogStart(chalk.red, `ERROR`, `[error()]`) + e, true, this.fileNames.ERROR);
        }
    }

    debug(message, prefix){
        var level = "DEBUG";
        if(!this.canLog(level)) return;

        try{
            prefix = prefix || false;
            this.log(this.getLogMessage(chalk.yellow, "DEBUG", message, prefix), true, this.fileNames.DEBUG);
        }catch(e){
            this.error(e, "debug()");
        }
    }

    info(message, prefix){
        var level = "INFO";
        if(!this.canLog(level)) return;

        try{
            prefix = prefix || false;
            this.log(this.getLogMessage(chalk.green, "INFO", message, prefix), true, this.fileNames.OUTPUT);
        }catch(e){
            this.error(e, "info()");
        }
    }

    warning(message, prefix){
        var level = "WARNING";
        if(!this.canLog(level)) return;

        try{
            prefix = prefix || false;
            this.log(this.getLogMessage(chalk.magenta, "WARNING", message, prefix), true, this.fileNames.ERROR);
        }catch(e){
            this.error(e, "warning()");
        }
    }

    gwen(message, prefix){
        var level = "GWEN";
        if(!this.canLog(level)) return;

        try{
            prefix = prefix || false;
            this.log(this.getLogMessage(chalk.magenta, "GWEN", message, prefix), true, this.fileNames.GWEN);
        }catch(e){
            this.error(e, "gwen()");
        }
    }

    command(name, command, type, success){
        var level = "COMMAND";
        if(!this.canLog(level)) return;

        try{
            type    = type || "/m";
            if(success == undefined) success = true;

            var successColorString = '';
            if(success) successColorString = chalk.green("Successfully");
            else        successColorString = chalk.red("Unsuccessfully");

            var logString = `User ${chalk.cyan(name)} executed the ${chalk.cyan(type)} command ${chalk.cyan(command)} ${successColorString}`;

            this.log(logString, true, this.fileNames.COMMAND);
        }catch(e){
            this.error(e, "command()");
        }
    }
}

module.exports = new Logger();