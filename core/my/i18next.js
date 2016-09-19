module.exports = (() => {
	'use strict';

	const i18next = require('i18next');
	const Backend = require('i18next-node-fs-backend');
	const sprintf = require('i18next-sprintf-postprocessor');
	i18next.use(Backend).use(sprintf).init({
		backend: {
			loadPath: process.cwd() + '/locales/{{lng}}/{{ns}}.json',
		},
		lng: 'pt_br',
		attributes: ['t', 'i18n'],
		fallbackLng: 'en',
		debug: false
	});

	return i18next;
})
