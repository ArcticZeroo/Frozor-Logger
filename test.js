var log = require('./logger');

log.setLogLevel("DEBUG");

log.info(`Hello world!`);

log.info(`Log level is currently set to ${log.getLogLevel()}`);
log.info(`Local log level is currently set to ${log.getLocalLogLevel()}`);

log.debug(`This is a debug message!`);

log.setLocalLogLevel('INFO');
log.debug(log.getLocalLogLevelInt());

log.error(`This is an error message!`);

log.warning(`This is a warning! Spooky!`);

log.info(`This is an info message with a prefix!`, "PREFIX");

log.setPrefix(`TEST`);
log.debug(`This is a debug message with a global prefix!`, "PREFIX");


log.command(`Cool man`, `Test Command`, 'Console', true);

log.command(`Not cool man`, `Test Command 2`, 'Console', false);

//To give time for WritableStreams to open
setTimeout(()=>{
    process.exit();
}, 5*1000);