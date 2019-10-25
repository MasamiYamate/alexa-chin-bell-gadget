const gadgetDirective = require('../directive/gadgetDirectiveFactory.js');
const language = require('../language/manager.js');

module.exports = {
    launchHandler: launchHandler,
    helpHandler: helpHandler
}

/**
 * LaunchHandler
 *
 * @param {*} handlerInput
 * @returns レスポンス
 */
async function launchHandler (handlerInput) {
    // 最初にgadgetとの接続確認を行う
    if (!gadgetUtil.connectGadgets(handlerInput)) {
        // gadgetが見つからなかった場合
        return handlerInput.responseBuilder
            .speak(language.speekText('GADGET_NOT_FOUND'))
            .getResponse();    
    }
    // ガジェットと接続が確認できた場合
    // 接続されているEndpoint一覧を取得します
    let endPoints = gadgetUtil.gadgetEndPoints(handlerInput);
    // sessionAttributeにEndpoint一覧を登録します
    gadgetUtil.setEndPoints(handlerInput, endPoints);

    // 今回は接続されているEndPointのうち0番目のgadgetを利用する
    let sendEndPoint = endPoints[0];
    let sendGadgetDirective = gadgetDirective.initializeRequest(sendEndPoint);

    //　接続確認後のレスポンスを返却します
    return handlerInput.responseBuilder
        .speak(language.speekText('LAUNCH_RESPONSE'))
        .addDirective(sendGadgetDirective)
        .getResponse();
}

/**
 *　HelpHandler
 *
 * @param {*} handlerInput
 * @returns
 */
async function helpHandler (handlerInput) {
    return handlerInput.responseBuilder
        .speak(language.speekText('HELP_RESPONSE'))
        .getResponse();
}