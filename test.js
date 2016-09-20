var log = require('./logger');

log.setLogLevel("DEBUG");

log.info(`Hello world!`);

log.info(`Log level is currently set to ${log.getLogLevel()}`);

log.debug(`This is a debug message!`);

log.error(`This is an error message!`);

log.warning(`This is a warning! Spooky!`);

log.info(`This is an info message with a prefix!`, "PREFIX");
log.info(`This is a debug message with a prefix!`, "PREFIX");

log.command(`Cool man`, `Test Command`, 'Console', true);

//To give time for WritableStreams to open
setTimeout(()=>{
    process.exit();
}, 10*1000);