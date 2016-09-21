# Frozor-Logger
Custom logging module for my node projects. The module uses localized time strings, colors for eeach type, and optional prefixes for console messages. Also uses log files INSIDE THE MODULE FOLDER to log output. 

Dependencies:

* chalk

Usage:

`var log = require('frozor-logger');`
Will return a new instance of the `Logger` class.

Methods:
```
//To actually log things:
log.info(message, prefix);
log.debug(message, prefix);
log.error(message, prefix);
log.command(name, command, type, success);
log.gwen(message, prefix);
log.warning(message, prefix);

//To change log level:
log.setLogLevel("ALL"|"DEBUG"|"GWEN"|"COMMAND"|"INFO"|"WARNING"|"ERROR"|"NONE");

//To see what level the console is at:
log.getLogLevel(); //Returns string
log.getLogLevelInt(); //Returns int of index
```

The `Logger` class also has `chalk` acessible as a property (e.g. `log.chalk`) so you can use chalk without declaring an extra variable in your projects.

You could also use log.getConsoleTimestamp() if you want that and are too lazy to do it yourself.
