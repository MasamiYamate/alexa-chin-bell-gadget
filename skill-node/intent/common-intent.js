const gadgetUtil = require('../util/gadget-tool-util');

module.exports = {
    launchHandler: launchHandler,
    helpHandler: helpHandler,
    errorHandler: errorHandler
}

/**
 * LaunchHandler
 *
 * @param {*} handlerInput
 * @returns レスポンス
 */
async function launchHandler (handlerInput) {
    let isGadgetActive = false

    // 最初にgadgetとの接続確認を行う
    if (!gadgetUtil.connectGadgets(handlerInput)) {
        // gadgetが見つからなかった場合
        return handlerInput.responseBuilder
            .withShouldEndSession(true)
            .speak('Echoデバイスに接続されているガジェットが見つかりませんでした。ガジェットとの接続を確認した後、再度スキルを呼び出してみてください。')
            .getResponse();    
    }
    // ガジェットと接続が確認できた場合
    // 接続されているEndpoint一覧を取得します
    let endPoints = await gadgetUtil.gadgetEndPoints(handlerInput);
    if (0 < endPoints.length) {
        await gadgetUtil.setEndPoints(endPoints);
        await gadgetUtil.setSessionToken(handlerInput);
        isGadgetActive = true;
    }

    if (isGadgetActive) {
        //　接続確認後のレスポンスを返却します
        return handlerInput.responseBuilder
            .speak('Echoデバイスとガジェットの接続を確認できました。何分間のセッションを行いますか？')
            .withShouldEndSession(false)
            .getResponse();
    }else{
        return handlerInput.responseBuilder
            .withShouldEndSession(true)
            .speak('Echoデバイスに接続されているガジェットが見つかりませんでした。ガジェットとの接続を確認した後、再度スキルを呼び出してみてください。')
            .getResponse();    
    }

}

/**
 *　HelpHandler
 *
 * @param {*} handlerInput
 * @returns
 */
async function helpHandler (handlerInput) {
    return handlerInput.responseBuilder
        .speak('このスキルは、技術勉強会などのタイムキーパー向けスキルです。')
        .withShouldEndSession(false)
        .getResponse();
}

/**
 *　ErrorHandler
 *
 * @param {*} handlerInput
 * @returns
 */
async function errorHandler (handlerInput) {
    return handlerInput.responseBuilder
        .speak("エラー")
        .withShouldEndSession(true)
        .getResponse();
}