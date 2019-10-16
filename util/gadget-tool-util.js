const http = require('./http.js');

module.exports = {
    endPoints = gadgetEndPoints
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

async function gadgetEventHandlerDirective(names, namespaces, token, durationMs, filterMatchAction, expirationPayload) {
    
}
