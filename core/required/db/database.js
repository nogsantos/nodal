module.exports = (() => {

  'use strict';

  const colors = require('colors/safe');

  const log = require('log4js').getLogger('DataBase');

  const DEFAULT_ADAPTER = 'postgres';
  const ADAPTERS = {
    'postgres': './adapters/postgres.js',
  };

  class Database {

    constructor() {

      this.adapter = null;
      this._useLogColor = 0;

    }

    connect(cfg) {

      if (typeof cfg === 'string') {
        cfg = {connectionString: cfg};
      }

      const Adapter = require(ADAPTERS[cfg.adapter] || ADAPTERS[DEFAULT_ADAPTER]);
      this.adapter = new Adapter(this, cfg);

      return true;

    }

    close(callback) {

      this.adapter.close.apply(this, arguments);
      callback && callback.call(this);
      return true;

    }

    log(sql, params, time) {

      let colorFunc = this.__logColorFuncs[this._useLogColor];


      log.trace(colorFunc(sql));
      params.length > 0 && log.trace(colorFunc(JSON.stringify(params)));
      time.length > 0 && log.info(colorFunc(time + 'ms'));


      this._useLogColor = (this._useLogColor + 1) % this.__logColorFuncs.length;

      return true;

    }

    info(message) {

      log.info(colors.green.bold('Database Info: ') + message);

    }

    error(message) {

      console.log(colors.red.bold('Database Error: ') + message);
      return true;

    }

    query() {

      this.adapter.query.apply(this.adapter, arguments);

    }

    transaction() {

      this.adapter.transaction.apply(this.adapter, arguments);

    }

    drop() {

      this.adapter.drop.apply(this.adapter, arguments);

    }

    create() {

      this.adapter.create.apply(this.adapter, arguments);

    }

  }

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
