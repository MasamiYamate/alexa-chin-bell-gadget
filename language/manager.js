const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');

const languageStrings = {
    'ja-JP': require('./ja-JP')
};

module.exports = {
    localizationInterceptor = localizationInterceptor,
    speekText = speekText
}

const localizationInterceptor = {
    process(handlerInput) {
        const localizationClient = i18n.use(sprintf).init({
            lng: handlerInput.requestEnvelope.request.locale,
            fallbackLng: 'en-US', // fallback to EN if locale doesn't exist
            resources: languageStrings
        });
  
        localizationClient.localize = function () {
            const args = arguments;
            let values = [];
  
            for (var i = 1; i < args.length; i++) {
                values.push(args[i]);
            }
            const value = i18n.t(args[0], {
                returnObjects: true,
                postProcess: 'sprintf',
                sprintf: values
            });
  
            if (Array.isArray(value)) {
                return value[Math.floor(Math.random() * value.length)];
            } else {
                return value;
            }
        }
  
        const attributes = handlerInput.attributesManager.getRequestAttributes();
        attributes.t = function (...args) { // pass on arguments to the localizationClient
            return localizationClient.localize(...args);
        };
    },
  };

  function speekText(handlerInput, key) {
      key = key || '';
      let result = '';
      const attributesManager = handlerInput.attributesManager;
      const requestAttributes = attributesManager.getRequestAttributes();
      result = requestAttributes.t(key)
      return result;
  }