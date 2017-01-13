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
     * @param Array ordered_files_to_test An ordered list to make the test
     */
    constructor(dir, router, ordered_files_to_test) {
        let tests = [];
        let addTest = [];
        if (ordered_files_to_test && ordered_files_to_test.length > 0) {
            ordered_files_to_test.forEach(file => {
                let Test = require(path.resolve(dir, `${file}_test.js`));
                tests.push(new Test(this));
            }, this);
        } else {
            addTest = dir => { // recursive add files to tests
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
        }
        this.router = router;
        this._tests = tests; // array 
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
