const gadgetUtil = require('../util/gadget-tool-util');

const nameSpace = 'Custom.ChinBell'

module.exports = {
    initialize = initialize,
    blanc = blanc,
    start = start,
    end = end,
    sessionPersistence = sessionPersistence
}

/**
 *　初期化用のガジェットディレクティブ
 *
 * @param {*} endPointId
 * @returns
 */
function initialize(endPointId) {
    let name = 'InitializeRequest';
    return gadgetUtil.createSendDirective(name, nameSpace, endPointId, null);
}

/**
 * Session開始のガジェットディレクティブ
 *
 * @param {*} endPointId
 * @returns
 */
function start(endPointId, dateString) {
    dateString = dateString | "";
    let name = 'start';
    let sendPayload = {
        date: dateString
    }
    return gadgetUtil.createSendDirective(name, nameSpace, endPointId, sendPayload);
}

function end(token, expirationPayload) {
    let names = ['end'];
    let nameSpaces = [nameSpace];
    return gadgetUtil.createStartEventHandlerDirective(names, nameSpaces, token, "SEND_AND_TERMINATE", null, expirationPayload);
}

function sessionPersistence(token, expirationPayload) {
    let names = ['persistence'];
    let nameSpaces = [nameSpace];
    return gadgetUtil.createStartEventHandlerDirective(names, nameSpaces, token, "SEND_AND_TERMINATE", null, expirationPayload);
}

/**
 * セッション永続用のガジェットディレクティブ
 *
 * @param {*} endPointId
 * @returns
 */
function blancRequest(endPointId) {
    let name = 'BlancRequest';
    return gadgetUtil.createSendDirective(name, nameSpace, endPointId, null);
}