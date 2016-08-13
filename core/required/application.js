module.exports = (() => {

  'use strict';

  const fxn = require('fxn');
  const API = require('./api.js');
  const log = require('log4js').getLogger('Controller');

  class Application extends fxn.Application {

    constructor() {

      super('Nodal');

    }

    /**
    * HTTP Error
    */
    error(req, res, start, status, message, err) {

      status = status || 500;
      message = message || 'Internal Server Error';

      let headers = {'Content-Type': 'application/json'};

      err && log.error(err.stack);

      this.send(
        req,
        res,
        start,
        status,
        headers,
        JSON.stringify(
          API.error(
            message,
            (process.env.NODE_ENV !== 'production' && err) ?
              err.stack.split('\n') : null
          ),
          null,
          2
        ),
        message
      );

    }

  }

  return Application;

})();
