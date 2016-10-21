module.exports = (() => {
	'use strict';

	const i18next = require('i18next');
	const Backend = require('i18next-node-fs-backend');
	return i18next.use(Backend).init({
		resources: `${process.cwd()}/locales/{{lng}}/{{ns}}.json`,
		lng: process.env.LANG_DEFAULT || 'en',
        fallbackLng: 'en',
        preload: true,
        initImmediate: false,
		debug: true
	});
})
