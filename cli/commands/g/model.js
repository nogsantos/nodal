'use strict';
const Command = require('cmnd').Command;
const GenerateMigrationCommand = require('./migration.js');
const generateMigration = new GenerateMigrationCommand();
const fs = require('fs');
const Database = require('../../../core/module.js').Database;
const colors = require('colors/safe');
const inflect = require('i')();
const log = require('log4js').getLogger('Model');
const dot = require('dot');
let templateSettings = Object.keys(dot.templateSettings).reduce((o, k) => {
    o[k] = dot.templateSettings[k];
    return o;
}, {});
templateSettings.strip = false;
templateSettings.varname = 'data';
let modelDir = './app/models';
/**
 * 
 */
function generateModelDefinition(modelName, columns) {

    let model = {
        name: modelName,
        columns: columns,
        for: modelName,
        since: new Date().toString(),
        author: process.env.USER
    };

    return dot.template(
        fs.readFileSync(__dirname + '/../../templates/model.jst').toString(),
        templateSettings
    )(model);

}
/**
 * 
 */
function generateUserDefinition() {
    return dot.template(
        fs.readFileSync(__dirname + '/../../templates/models/user.jst').toString(),
        templateSettings
    )();
}
/**
 * 
 */
function generateAccessTokenDefinition() {
    return dot.template(
        fs.readFileSync(__dirname + '/../../templates/models/access_token.jst').toString(),
        templateSettings
    )();
}
/**
 * 
 */
function convertArgListToPropertyList(argList) {

    // Instantiate Database so we can get access to the Adapater types
    let db = new Database();
    db.connect(require(`${process.cwd()}/config/db.json`)[process.env.NODE_ENV || 'development']);

    return argList.slice(1).map(function (v) {
        v = v.split(':');

        if (Object.keys(db.adapter.types).indexOf(v[1].toLowerCase()) == -1) {
            throw new Error(log.error(`Unsupported column type ${colors.yellow.bold(v[1])} for field ${colors.yellow.bold(v[0])}`));
        }

        let obj = {
            name: inflect.underscore(v[0]),
            type: v[1].toLowerCase()
        };
        let rest = v.slice(2);
        let properties = {};

        ['array', 'unique'].forEach(v => {
            if (rest.indexOf(v) !== -1) {
                properties[v] = true;
            }
        });

        Object.keys(properties).length && (obj.properties = properties);

        return obj;
    });
}
/**
 * 
 */
function generateModelSchemaObject(modelName, propertyList) {

    let tableName = inflect.tableize(modelName);
    if (propertyList.filter(c => c.name === tableName).length) {
        throw new Error(log.error(`Can not create a table with an identical field name. (${tableName}.${tableName})`));
    }
    return {
        table: inflect.tableize(modelName),
        columns: propertyList
    };
}
/**
 * 
 */
class GenerateModelCommand extends Command {
    /**
     * 
     */
    constructor() {
        super('g', 'model');
    }
    /**
     * 
     */
    help() {
        return {
            description: 'Generate a new model and associated migration',
            args: ['ModelName', 'field_1:type_1', '...', 'field_n:type_n'],
            vflags: {
                user: 'Use a prebuilt User model',
                access_token: 'Use a prebuilt AccessToken model'
            }
        };
    }
    /**
     * 
     */
    run(args, flags, vflags, callback) {
        if (vflags.hasOwnProperty('user')) {
            args = [
                'User',
                'email:string:unique',
                'password:string',
                'username:string'
            ];
        } else if (vflags.hasOwnProperty('access_token')) {
            args = [
                'AccessToken',
                'user_id:int',
                'access_token:string',
                'token_type:string',
                'expires_at:datetime',
                'ip_address:string'
            ];
        }

        if (!args.length) {
            log.error("No model name specified.");
            return callback(null);
        }

        let modelName = inflect.classify(args[0]);
        let schemaObject;

        try {
            schemaObject = generateModelSchemaObject(modelName, convertArgListToPropertyList(args));
        } catch (e) {
            return callback(e);
        }

        !fs.existsSync(modelDir) && fs.mkdirSync(modelDir);

        let createPath = modelDir + '/' + inflect.underscore(modelName) + '.js';

        if (fs.existsSync(createPath)) {
            return callback(log.error('Model already exists'));
        }

        if (vflags.hasOwnProperty('user')) {
            fs.writeFileSync(createPath, generateUserDefinition());
        } else if (vflags.hasOwnProperty('access_token')) {
            fs.writeFileSync(createPath, generateAccessTokenDefinition());
        } else {
            fs.writeFileSync(createPath, generateModelDefinition(modelName));
            log.info(`${colors.bold('Great!')} Now, if necessary, you can generate a Controller for this Model, just run: ${colors.bold.blue("$ nodal g:controller [optional version] --for "+modelName)}`);
        }

        log.info(colors.green.bold('Create: ') + createPath);

        generateMigration.run([`create_${schemaObject.table}`], {}, {
            for: args
        }, (err, result) => {
            if (err) {
                return callback(err);
            }
            if (vflags.hasOwnProperty('user')) {
                log.info('Installing additional packages in this directory...');
                let spawn = require('cross-spawn-async');
                let child = spawn('npm', ['install', 'bcrypt', '--save'], {
                    cwd: process.cwd(),
                    stdio: 'inherit'
                });
                child.on('exit', function () {
                    child && child.kill();
                    callback(null);
                });
                return;
            }
            callback(null);
        });
    }
}
module.exports = GenerateModelCommand;
