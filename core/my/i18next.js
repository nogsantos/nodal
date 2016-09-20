module.exports = (() => {
  'use strict';

  const i18next = require('i18next');
  const Backend = require('i18next-node-fs-backend');
  // const sprintf = require('i18next-sprintf-postprocessor');
  // i18next.use(Backend).use(sprintf).init({
  i18next.use(Backend).init({
    backend: {
      loadPath: `${process.cwd()}/locales/{{lng}}/{{ns}}.json`,
    },
    lng: process.env.LANG_DEFAULT || 'en',
    attributes: ['t', 'i18n'],
    fallbackLng: 'en',
    debug: false
  });

  return i18next;
})
