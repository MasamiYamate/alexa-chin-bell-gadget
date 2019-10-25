const gadgetUtil = require('../util/gadget-tool-util');

const nameSpace = 'Custom.ChinBell'

module.exports = {
    initializeRequest = initializeRequest,
    blancRequest = blancRequest
}

/**
 *　初期化用のガジェットディレクティブ
 *
 * @param {*} endPointId
 * @returns
 */
function initializeRequest(endPointId) {
    let name = 'InitializeRequest';
    return gadgetUtil.createSendDirective(name, nameSpace, endPointId, null);
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