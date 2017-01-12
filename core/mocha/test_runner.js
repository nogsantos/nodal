'use strict';
const fs = require('fs');
const path = require('path');
/**
 * Prepare files and run the tests
 */
class TestRunner {
    /**
     * Load file to tests
     * 
     * @param String dir The directory to files to test
     * @param Include router Load the app routers
     */
    constructor(dir, router) {
        let tests = [];
        let addTest = dir => { // recursive add files to tests
            return filename => {
                if (!path.extname(filename) && filename[0] !== '.') {
                    let nextDir = path.resolve(dir, filename);
                    return fs.readdirSync(nextDir).forEach(addTest(nextDir));
                }
                let Test = require(path.resolve(dir, filename));
                tests.push(new Test(this));
            };
        };
        let testDir = path.resolve(process.cwd(), dir || '/');
        fs.readdirSync(testDir).forEach(addTest(testDir));
        this._tests = tests; // array 
        this.router = router;
    }
    /**
     * Mocha, do the tests 
     */
    start(verb) {
        this._tests.forEach(t => {
            t.__test__(verb);
        });
    }
}
module.exports = TestRunner;
