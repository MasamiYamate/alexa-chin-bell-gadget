const Alexa = require('ask-sdk-core');

const skillUtil = require('./util/skil-util');
const gadgetUtil = require('./util/gadget-tool-util');

const commonIntent = require('./intent/common-intent');
const timerIntent = require('./intent/time-intent');

const language = require('./language/manager.js');

let skill;
exports.handler = function(event, context) {
    if (!skill) {
        skill = Alexa.SkillBuilders.custom()
            .addRequestHandlers(
                handler.LaunchRequestHandler,
                handler.HelpRequestHandler,
                handler.TimeSelectHandler,
                handler.CustomInterfaceEventHandler,
                handler.SessionEndedRequestHandler,
                handler.SkillEndHandler
            )
            .addRequestInterceptors(language.localizationInterceptor, handler.RequestInterceptor)
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
    HelpRequestHandler: {
        canHandle(handlerInput) {
            return skillUtil.checkIntentTypeName(handlerInput, 'IntentRequest', 'AMAZON.NoIntent');
        },
        async handle(handlerInput) {
            return commonIntent.helpHandler(handlerInput);
        }
    },
    TimeSelectHandler: {
        canHandle(handlerInput) {
            return skillUtil.checkIntentTypeName(handlerInput, 'IntentRequest', 'TimeSelectIntent');
        },
        async handle(handlerInput) {
            return timerIntent.timeSelectHandler(handlerInput);
        }
    },
    CustomInterfaceEventHandler: {
        canHandle(handlerInput) {
            return skillUtil.checkIntentTypeName(handlerInput, 'CustomInterfaceController.EventsReceived');
        },
        async handle(handlerInput) {
            if(gadgetUtil.matchResponseHandler(handlerInput, 'start', 'Custom.ChinBell')) {
                // startのResponseのとき
                return timerIntent.gadgetSpeakResponse(handlerInput);
            }else if (gadgetUtil.matchResponseHandler(handlerInput, 'end', 'Custom.ChinBell')) {
                return timerIntent.sessionEndResponse(handlerInput);
            }else {
                return timerIntent.sessionPersistenceResponse(handlerInput);
            }
        }
    },
    SessionEndedRequestHandler: {
        canHandle(handlerInput) {
            return skillUtil.checkIntentTypeName(handlerInput, 'SessionEndedRequest');
        },
        handle(handlerInput) {
            return handlerInput.responseBuilder.getResponse();
        }
    },
    SkillEndHandler: {
        canHandle(handlerInput) {
            return (
                skillUtil.checkIntentTypeName(handlerInput, 'IntentRequest', 'AMAZON.CancelIntent') ||
                skillUtil.checkIntentTypeName(handlerInput, 'IntentRequest', 'AMAZON.StopIntent')
            );
        },
        handle(handlerInput) {
            return handlerInput.responseBuilder.getResponse();
        }
    },
    ErrorHandler: {
        canHandle(handlerInput) {
            return true;
        },
        handle(handlerInput) {
            return handlerInput.responseBuilder
                .speak("申し訳ありません、内部エラーが発生しました。")
                .withShouldEndSession(true)
                .getResponse();
        },
    }
}