'use strict';
const colors = require('colors/safe');
const DEFAULT_ADAPTER = 'postgres';
const log4js = require('log4js');
const environment = process.env.NODE_ENV;
const ADAPTERS = {
    'postgres': './adapters/postgres.js',
};
/**
 * 
 */
class Database {
    /**
     * 
     */
    constructor() {
        this.adapter = null;
        if (environment !== "production") {
            log4js.loadAppender('console');
            log4js.addAppender(log4js.appenders.console());
        } else {
            log4js.loadAppender('file');
            log4js.addAppender(log4js.appenders.file(`./logs/error-${new Date().toISOString()}.log`), '[DATABASE]' || 'SERV');
        }
        this.logger = log4js.getLogger('[DATABASE]');
    }
    /**
     * 
     */
    connect(cfg) {
        if (typeof cfg === 'string') {
            cfg = {
                connectionString: cfg
            };
        }
        const Adapter = require(ADAPTERS[cfg.adapter] || ADAPTERS[DEFAULT_ADAPTER]);
        this.adapter = new Adapter(this, cfg);
        return true;
    }
    /**
     * 
     */
    close(callback) {
        this.adapter.close.apply(this, arguments);
        callback && callback.call(this);
        return true;
    }
    /**
     * 
     */
    log(sql, params, time) {
        if (process.env.NODAL_TRACE_QUERY && process.env.NODAL_TRACE_QUERY === 'true') {
            this.logger.trace(`
                ${colors.yellow.bold(sql)}
                ${colors.blue.bold('Param(s): '+JSON.stringify(params))}
                ${colors.blue.bold('Time: '+time + 'ms')}
            `);
        }
        return true; // yet?
    }
    /**
     * 
     */
    info(message) {
        if (process.env.NODAL_TRACE_INFO && process.env.NODAL_TRACE_INFO === 'true') {
            this.logger.info(colors.green.bold('Database Info: ') + message);
        }
    }
    /**
     * 
     */
    error(message) {
        this.logger.error(colors.red.bold('Database Error: ') + message);
        return true;
    }
    /**
     * 
     */
    query() {
        this.adapter.query.apply(this.adapter, arguments);
    }
    /**
     * 
     */
    transaction() {
        this.adapter.transaction.apply(this.adapter, arguments);
    }
    /**
     * 
     */
    drop() {
        this.adapter.drop.apply(this.adapter, arguments);
    }
    /**
     * 
     */
    create() {
        this.adapter.create.apply(this.adapter, arguments);
    }
}
/**
 * @deprecated
 */
Database.prototype.__logColorFuncs = [
    (str) => {
        return colors.yellow.bold(str);
    },
    (str) => {
        return colors.white(str);
    }
];

module.exports = Database;
