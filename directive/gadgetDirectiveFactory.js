const gadgetUtil = require('../util/gadget-tool-util');

module.exports = {
    initializeRequest = initializeRequest
}

function initializeRequest(endPointId) {
    let name = ' InitializeRequest'
    let nameSpace = 'Custom.ChinBell'
    return gadgetUtil.createSendDirective(name, nameSpace, endPointId, null);
}