'use strict';
const Nodal = require('nodal');
/**
 * Dummy task example
 */
class DummyTask {
    /**
     * 
     */
    exec(args, callback) {
        console.log('Dummy task executed');
        callback();
    }
}
module.exports = DummyTask;
