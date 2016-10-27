module.exports = (() => {

  'use strict';

  const fxn = require('fxn');
  const API = require('./api.js');

  class Controller extends fxn.Controller {

    /**
    * Using API formatting, send an http.ServerResponse indicating there was a Bad Request (400)
    * @param {string} msg Error message to send
    * @param {Object} details Any additional details for the error (must be serializable)
    * @return {boolean}
    */
    badRequest(msg, details) {
      this.status(400);
      this.render(API.error(msg || `service.error.bad_request`, details));
      return true;
    }

    /**
    * Using API formatting, send an http.ServerResponse indicating there was an Unauthorized request (401)
    * @param {string} msg Error message to send
    * @param {Object} details Any additional details for the error (must be serializable)
    * @return {boolean}
    */
    unauthorized(msg, details) {
      this.status(401);
      this.render(API.error(msg || `service.error.unauthorized`, details));
      return true;
    }

    /**
    * Using API formatting, send an http.ServerResponse indicating the requested resource was Not Found (404)
    * @param {string} msg Error message to send
    * @param {Object} details Any additional details for the error (must be serializable)
    * @return {boolean}
    */
    notFound(msg, details) {
      this.status(404);
      this.render(API.error(msg || `service.error.not_foud`, details));
      return true;
    }

    /**
    * Endpoint not implemented
    * @param {string} msg Error message to send
    * @param {Object} details Any additional details for the error (must be serializable)
    * @return {boolean}
    */
    notImplemented(msg, details) {
      this.status(501);
      this.render(API.error(msg  || `service.error.not_implemented`, details));
      return true;
    }

    /**
    * Using API formatting, send an http.ServerResponse indicating there were Too Many Requests (429) (i.e. the client is being rate limited)
    * @param {string} msg Error message to send
    * @param {Object} details Any additional details for the error (must be serializable)
    * @return {boolean}
    */
    tooManyRequests(msg, details) {
      this.status(429);
      this.render(API.error(msg || `service.error.many_requests`, details));
      return true;
    }

    /**
    * Using API formatting, send an http.ServerResponse indicating there was an Internal Server Error (500)
    * @param {string} msg Error message to send
    * @param {Object} details Any additional details for the error (must be serializable)
    * @return {boolean}
    */
    error(msg, details) {
      this.status(500);
      this.render(API.error(msg || `service.error.server_error`, details));
      return true;
    }

    /**
    * Using API formatting, generate an error or respond with model / object data.
    * @param {Error|Object|Array|Nodal.Model|Nodal.ModelArray} data Object to be formatted for API response
    * @param {optional Array} The interface to use for the data being returned, if not an error.
    * @return {boolean}
    */
    respond(data, arrInterface) {

      if (data instanceof Error) {

        if (data.notFound) {
          return this.notFound(data.message, data.details);
        }

		var message = "";
		switch(data.code){
			case "23000": //INTEGRITY CONSTRAINT VIOLATION
				message = `service.error.integrity_constrant_violation`;
			break
			case "23502": //NOT NULL VIOLATION
				message = `service.error.not_null_violation`;
			break
			case "23503": //FOREIGN KEY VIOLATION
				message = `service.error.foreing_key_violation`;
			break
			case "23505": //UNIQUE VIOLATION
				message = `service.error.unique_violation`;
			break
			default:
				message = data.message;
			break
		}

        return this.badRequest(message, data.details);

      }

      this.render(API.format(data, arrInterface));
      return true;

    }

  }

  return Controller;

})();
