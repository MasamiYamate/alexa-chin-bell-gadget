const Https = require('https');
const uuid = require('uuid/v4');

module.exports = {
    connectGadgets: connectGadgets,
    gadgetEndPoints: gadgetEndPoints,
    setEndPoints: setEndPoints,
    sessionToken: sessionToken,
    setSessionToken: setSessionToken,
    matchResponseHandler: matchResponseHandler,
    getPayload: getPayload,
    createSendDirective: createSendDirective,
    createStartEventHandlerDirective: createStartEventHandlerDirective,
    createStopEventHandlerDirective: createStopEventHandlerDirective
}

/**
 * Alexaガジェットと接続し、結果を取得する
 *
 * @param {*} handlerInput
 * @returns Bool 接続結果
 */
async function connectGadgets (handlerInput) {
    let isConnected = false;
    let endPointIdsResponse = await gadgetEndPoints(handlerInput);
    if ((endPointIdsResponse.endpoints || []).length !== 0) {
        await setEndPoints(handlerInput, endPointIdsResponse.endPointIds);
        isConnected = true;
    }
    return isConnected;
}

/**
 *　接続されているAlexaガジェットのエンドポイントを取得する
 *
 * @param {*} handlerInput
 * @returns EndPointの配列 [String]
 */
function gadgetEndPoints (handlerInput) {
    let { context } = handlerInput.requestEnvelope;
    let { apiEndpoint, apiAccessToken } = context.System;

    apiEndpoint = (apiEndpoint || '').replace('https://', '');

    return new Promise(((resolve, reject) => {
        var options = {
            host: apiEndpoint,
            path: '/v1/endpoints',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiAccessToken
            }
        };

        console.log(options);

        const request = Https.request(options, (response) => {
            response.setEncoding('utf8');
            let returnData = '';

            response.on('data', (chunk) => {
                returnData += chunk;
            });

            response.on('end', () => {
                console.log(JSON.parse(returnData));
                let result = JSON.parse(returnData);
                let endPoints = result.endpoints || [];
                resolve(endPoints);
            });

            response.on('error', (error) => {
                reject(error);
            });
        });
        request.end();
    }));
}

/**
 * 接続されているガジェットのEndPointをsessionAttributeに登録する
 *
 * @param {*} handlerInput
 * @param {[String]} endPointIds
 */
function setEndPoints(handlerInput, endPointIds) {
    if (!endPointIds) {
        return;
    }
    const attributesManager = handlerInput.attributesManager;
    let sessionAttributes = attributesManager.getSessionAttributes();
    sessionAttributes.endPointIds = endPointIds;
    attributesManager.setSessionAttributes(sessionAttributes);
}

/**
 * sessionAttributeに登録されているセッショントークンを取得する
 *
 * @param {*} handlerInput
 * @returns 登録されているToken
 */
function sessionToken (handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    let sessionAttributes = attributesManager.getSessionAttributes();
    if (sessionAttributes.token) {
        return sessionAttributes.token;
    }
    return null;
}

/**
 * sessionTokenを新規に生成し、sesstionAttributeに登録する
 *
 * @param {*} handlerInput
 */
function setSessionToken (handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    let sessionAttributes = attributesManager.getSessionAttributes();
    sessionAttributes.token = uuid();
    attributesManager.setSessionAttributes(sessionAttributes);
}

/**
 * ガジェットからマッチング結果を取得する
 *
 * @param {*} handlerInput
 * @param {*} name
 * @param {*} nameSpace
 * @param {*} eventIndex
 * @returns 判定結果
 */
function matchResponseHandler(handlerInput, name, nameSpace, eventIndex) {
    let { request } = handlerInput.requestEnvelope;
    let customEvents = request.events;
    eventIndex = eventIndex || 0;

    // Tokenの有無を確認する
    let responseToken = request.token;
    let token = sessionToken(handlerInput);
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

/**
 * ガジェットからのResponseに含まれるPayloadを取得する
 *
 * @param {*} handlerInput
 * @param {*} eventIndex
 */
function getPayload (handlerInput, eventIndex) {
    eventIndex = eventIndex | 0;
    let { request } = handlerInput.requestEnvelope;
    if (eventIndex < request.events.length) {
        let customEvent = request.events[eventIndex];
        return customEvent.payload;
    }
    return null;
}

/**
 * ガジェットに送付するdirectiveを生成します
 *
 * @param {*} name
 * @param {*} namespace
 * @param {*} endPointId
 * @param {*} payload
 * @returns 送付するDerective
 */
function createSendDirective(name, namespace, endPointId, payload) {
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

/**
 * ガジェットからのEventを監視するdirectiveを生成する
 *
 * @param {*} names
 * @param {*} nameSpaces
 * @param {*} token
 * @param {*} filterMatchAction
 * @param {*} durationMs
 * @param {*} expirationPayload
 * @returns
 */
function createStartEventHandlerDirective(names, nameSpaces, token, filterMatchAction, durationMs, expirationPayload) {
    expirationPayload = expirationPayload || {};
    durationMs = durationMs || 90000;
    console.log(names);
    let nameFilters = [];
    for (let i in names) {
        let name = names[i];
        nameFilters.push({ '==': [{ 'var': 'header.name' }, name]});
    }
    let nameSpaceFilters = [];
    for (let i in nameSpaces) {
        let nameSpace = nameSpaces[i];
        nameSpaceFilters.push({ '==': [{ 'var': 'header.namespace' }, nameSpace] })
    }
    let filters = nameFilters.concat(nameSpaceFilters);
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
