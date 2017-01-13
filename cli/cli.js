'use strict';
const CommandLineInterface = require('cmnd').CommandLineInterface;
const log4js = require('log4js');
const CLI = new CommandLineInterface();
/**
 * Configuring log4js for system
 */
log4js.configure({
    appenders: [{
        type: "console",
        category: ['Install', 'Controller', 'Model', 'DataBase', 'Help', 'Migration'],
    }],
    replaceConsole: false
});
CLI.load(__dirname, './commands');
module.exports = CLI;
