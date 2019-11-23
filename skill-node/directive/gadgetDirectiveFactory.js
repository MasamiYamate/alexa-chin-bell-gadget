const gadgetUtil = require('../util/gadget-tool-util');

const nameSpace = 'Custom.ChinBell'

module.exports = {
    start: start,
    sessionPersistence
}

/**
 * Session開始のガジェットディレクティブ
 *
 * @param {*} endPointId
 * @returns
 */
function start(endPointId, dateString) {
    let name = 'start';
    let sendPayload = {
        date: dateString
    }
    return gadgetUtil.createSendDirective(name, nameSpace, endPointId, sendPayload);
}

function sessionPersistence(token, expirationPayload) {
    let names = ['SkillHandler'];
    let nameSpaces = [nameSpace];
    return gadgetUtil.createStartEventHandlerDirective(names, nameSpaces, token, "SEND_AND_TERMINATE", null, expirationPayload);
}