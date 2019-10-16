const http = require('./http.js');

module.exports = {
    endPoints = gadgetEndPoints,
    createSendDirective = createSendDirective,
    createStartEventHandlerDirective = createStartEventHandlerDirective
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

async function createStartEventHandlerDirective(names, nameSpaces, token, filterMatchAction, durationMs, expirationPayload) {
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
