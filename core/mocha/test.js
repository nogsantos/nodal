 'use strict';
 const EndpointRequest = require('./endpoint_request.js');
 /**
  * Test
  */
 class Test {
     /**
      * 
      */
     constructor(testRunner) {
         this.testRunner = testRunner;         
         Object.defineProperty(this, 'router', {
             get: () => this.testRunner.router
         });
     }
     /**
      * 
      */
     __test__(verb) {
         describe(this.constructor.name, () => {
             this.before && before(this.before.bind(this, verb));
             this.test(verb);
             this.after && after(this.after.bind(this, verb));
         });
     }
     /**
      * 
      */
     test() {}
     /**
      * Creates a new MockRequest object (emulates an HTTP request)
      * @param {string} path The path you wish to hit
      * @param {Object} query The query parameters you wish to pass
      * @param {String} method The request method: POST, PUT, DELETE (body params) or empty===GET (Query params)
      * @return {Nodal.EndpointRequest}
      */
     endpoint(path, query, method) {     
         return new EndpointRequest(this.router, path, query, method);
     }
 }
 module.exports = Test;
