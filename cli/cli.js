module.exports = (() => {

  'use strict';

  const CommandLineInterface = require('cmnd').CommandLineInterface;
  const CLI = new CommandLineInterface();
  /**
   * Configuring log4js for system
   */
  const log4js = require('log4js');  
  log4js.configure({
      appenders: [
        {
            type: "console",            
            category: [ 'Install','Controller', 'Model', 'Db' ],            
        }
    ],
    replaceConsole: true
  });

  CLI.load(__dirname, './commands');

  return CLI;

})();
