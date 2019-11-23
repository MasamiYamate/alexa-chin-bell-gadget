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
                handler.HelpRequestHandler,
                handler.TimeSelectHandler,
                handler.CustomInterfaceEventHandler,
                handler.SessionEndedRequestHandler,
                handler.RemainingTimeHandler,
                handler.SkillEndHandler,
                handler.DefaultHandler
            )
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
            return await timerIntent.timeSelectHandler(handlerInput);
        }
    },
    RemainingTimeHandler: {
        canHandle(handlerInput) {
            return skillUtil.checkIntentTypeName(handlerInput, 'IntentRequest', 'RemainingTimeIntent');
        },
        async handle(handlerInput) {
            return await timerIntent.remainingTimeResponse(handlerInput);
        }
    },
    CustomInterfaceEventHandler: {
        canHandle(handlerInput) {
            return skillUtil.checkIntentTypeName(handlerInput, 'CustomInterfaceController.EventsReceived');
        },
        async handle(handlerInput) {
            return timerIntent.gadgetEventHandler(handlerInput);
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
    DefaultHandler: {
        canHandle() {
            return true;
        },
        handle(handlerInput) {
            return handlerInput.responseBuilder
                .getResponse();
        }
    },
    ErrorHandler: {
        canHandle() {
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