const http = require('./http.js');
const uuid = require('uuid/v4');

module.exports = {
    connectGadgets = connectGadgets,
    gadgetEndPoints = gadgetEndPoints,
    setEndPoints = setEndPoints,
    sessionToken = sessionToken,
    setSessionToken = setSessionToken,
    matchResponseHandler = matchResponseHandler,
    createSendDirective = createSendDirective,
    createStartEventHandlerDirective = createStartEventHandlerDirective,
    createStopEventHandlerDirective = createStopEventHandlerDirective
}

async function connectGadgets (handlerInput) {
    let isConnected = false;
    let endPointIdsResponse = await gadgetEndPoints(handlerInput);
    if ((endPointIdsResponse.endpoints || []).length !== 0) {
        await setEndPoints(handlerInput, endPointIdsResponse.endPointIds);
        isConnected = true;
    }
    return isConnected;
}

async function gadgetEndPoints (handlerInput) {
    let { context } = handlerInput.requestEnvelope;
    let { apiEndpoint, apiAccessToken } = context.System;
    
    apiEndpoint = (apiEndpoint || '').replace('https://', '');
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiAccessToken
    }
    let result = await http.syncRequest(apiEndpoint, headers);
    return result;
}

async function setEndPoints(handlerInput, endPointIds) {
    if (!endPointIds) {
        return;
    }
    const attributesManager = handlerInput.attributesManager;
    let sessionAttributes = attributesManager.getSessionAttributes();
    sessionAttributes.endPointIds = endPointIds;
    attributesManager.setSessionAttributes(sessionAttributes);
}

function sessionToken (handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    let sessionAttributes = attributesManager.getSessionAttributes();
    if (sessionAttributes.token) {
        return sessionAttributes.token;
    }
    return null;
}

function setSessionToken (handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    let sessionAttributes = attributesManager.getSessionAttributes();
    sessionAttributes.token = uuid();
    attributesManager.setSessionAttributes(sessionAttributes);

}


async function matchResponseHandler(handlerInput, name, nameSpace, eventIndex) {
    let { request } = handlerInput.requestEnvelope;
    let customEvents = request.events;
    eventIndex = eventIndex || 0;

    // Tokenの有無を確認する
    let responseToken = request.token;
    let token = getSessionToken(handlerInput);
    if (token && token == responseToken) {
        if (customEvents.length <= 0 && eventIndex + 1 < customEvents.length) {
            let customEvent = customEvents[eventIndex];
            let responseName = customEvent.header.name;
            let responseNameSpace = customEvent.header.namespace;
            if (name == responseName && nameSpace == responseNameSpace) {
                return true;
            }
        }
    }
    return false;
}

async function createSendDirective(name, namespace, endPointId, payload) {
    payload = payload || {};
    return {
        type: 'CustomInterfaceController.SendDirective',
        header: {
            name: name,
            namespace: namespace
        },
        endpoint: {
            endpointId: endPointId
        },
        payload: payload
    }
}

function createStartEventHandlerDirective(names, nameSpaces, token, filterMatchAction, durationMs, expirationPayload) {
    expirationPayload = expirationPayload || {};
    durationMs = durationMs || 90000;
    let nameFilters = names.flatMap( name => [{ '==': [{ 'var': 'header.name' }, name]}]);
    let nameSpaceFilters = nameSpaces.flatMap( nameSpace => [{ '==': [{ 'var': 'header.namespace' }, nameSpace]}]);
    let filters = nameFilters + nameSpaceFilters;
    let filterExpression = {
        'and': filters
    };
    return {
        type: "CustomInterfaceController.StartEventHandler",
        token: token,
        eventFilter: {
            filterExpression: filterExpression,
            filterMatchAction: filterMatchAction
        },
        expiration: {
            durationInMilliseconds: durationMs,
            expirationPayload: expirationPayload
        }
    }
}

function createStopEventHandlerDirective(token) {
    return {
        type: "CustomInterfaceController.StopEventHandler",
        token: token
    }
}
