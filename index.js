const Alexa = require('ask-sdk-core');

const skillUtil = require('./util/skil-util');

const commonIntent = require('./intent/common-intent');
const timerIntent = require('./intent/time-intent');

let skill;
exports.handler = function(event, context) {
    if (!skill) {
        skill = Alexa.SkillBuilders.custom()
            .addRequestHandlers(
                handler.LaunchRequestHandler,
                handler.CustomInterfaceEventHandler,
                handler.CustomInterfaceExpirationHandler,
                handler.StopAndCancelIntentHandler,
                handler.SessionEndedRequestHandler,
                handler.DefaultHandler
            )
            .addRequestInterceptors(LocalizationInterceptor, handler.RequestInterceptor)
            .addResponseInterceptors(handler.ResponseInterceptor)
            .addErrorHandlers(handler.ErrorHandler)
            .create();
    }
    return skill.invoke(event, context);
};

const handler = {
    LaunchRequestHandler: {
        canHandle(handlerInput) {
            return skillUtil.checkIntentTypeName(handlerInput, 'LaunchRequest');
        },
        async handle(handlerInput) {
            return await commonIntent.launchHandler(handlerInput);
        }
    },
    CustomInterfaceEventHandler: {
        
    }
}