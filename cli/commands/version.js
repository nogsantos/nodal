module.exports = (() => {

    'use strict';

    const Command = require('cmnd').Command;
    const colors = require('colors/safe');
    const log4js = require('log4js');
    const logger = log4js.getLogger('Controller');

    class VersionCommand extends Command {

        constructor() {

            super('version');

        }

        help() {
            
            return {
                description: 'Shows your currently globally installed Nodal version'
            };

        }

        run(args, flags, vflags, callback) {

            let version = require('../../package.json').version;
            logger.info(colors.bold('Nodal Version: ') + version);

            callback(null);

        }

    }

    return VersionCommand;

})();
