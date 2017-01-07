module.exports = (() => {
    'use strict';
    const colors = require('colors/safe');
    const DEFAULT_ADAPTER = 'postgres';
    const log4js = require('log4js').getLogger('DB.CORE');
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
            this._useLogColor = 0;
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
            if (process.env.NODAL_ENV !== "test") { // clean test output
                let colorFunc = this.__logColorFuncs[this._useLogColor];
                log4js.debug(colorFunc(sql));
            }
            return true;
        }
        /**
         * 
         */
        info(message) {
            if (process.env.NODAL_ENV !== "test") { // clean test output
                log4js.info(colors.green.bold('Database Info: ') + message);
            }
        }
        /**
         * 
         */
        error(message) {
            log4js.error(colors.red.bold('Database Error: ') + message);
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
     * 
     */
    Database.prototype.__logColorFuncs = [
        (str) => {
            return colors.yellow.bold(str);
        },
        (str) => {
            return colors.white(str);
        }
    ];
    return Database;
})();
