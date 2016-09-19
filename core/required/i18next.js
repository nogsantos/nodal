module.exports = (() => {
    'use strict';

    const i18next = require('i18next');
    const Backend = require('i18next-node-fs-backend');
    i18next.use(Backend).init({
        backend: {
            loadPath: __dirname + '/locales/{{lng}}/{{ns}}.json',
        },
        lng: 'pt_br',
        attributes: ['t', 'i18n'],
        fallbackLng: 'en',
        debug: false
    });

    return i18next;
})
