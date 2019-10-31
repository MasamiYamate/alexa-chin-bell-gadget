const skilUtil = require('../util/skil-util');
const gadgetUtil = require('../util/gadget-tool-util');

const gadgetDirective = require('../directive/gadgetDirectiveFactory.js');
const language = require('../language/manager.js');

module.exports = {
    timeSelectHandler: timeSelectHandler,
    gadgetSpeakResponse: gadgetSpeakResponse,
    sessionPersistenceResponse: sessionPersistenceResponse,
    sessionEndResponse: sessionEndResponse
}

function timeSelectHandler (handlerInput) {
    let hour = skilUtil.slotValue(handlerInput, 'hour', false);
    let minute = skilUtil.slotValue(handlerInput, 'minute', false);
    
    if (!hour && !minute) {
        // 時刻が取得できない場合はエラーレスポンスを返却する
        let errorResponse = timeSelectErrorResponse(handlerInput);
        return errorResponse;
    }

    let addMinute = 0;
    let timeSpeechText = '';
    if (hour) {
        let addTime = Number(hour) * 60;
        addMinute += addTime; 
        timeSpeechText = hour + language.speekText('HOUR');
    }
    if (minute) {
        addMinute += Number(minute);
        timeSpeechText = timeSpeechText + minute + language.speekText('MINUTE');
    }
    
    // 現在の時刻オブジェクトを生成する
    let timerDate = new Date();
    // セッション時間を加算して終了時刻にする
    timerDate.setMinutes(timerDate.getMinutes() + addMinute);

    let sessionToken = gadgetUtil.sessionToken(handlerInput);

    // gadget側でSession開始を検出するためのディレクティブ
    let sessionStartDirective = gadgetDirective.start();
    // 永続化用のディレクティブ
    let persistenceDirective = gadgetDirective.sessionPersistence(sessionToken, null);
    // セッション終了用のディレクティブ
    let sessionEndDirective = gadgetDirective.end(sessionToken, null);

    // ◎時間◎分のセッションを開始しますと読み上げます
    return handlerInput.responseBuilder
        .speak(timeSpeechText + language.speekText('TIME_SELECT_RESPONSE'))
        .addDirective(sessionStartDirective)
        .addDirective(persistenceDirective)
        .addDirective(sessionEndDirective)
        .getResponse();
}

/**
 * セッション開始のレスポンスを返す
 *
 * @param {*} handlerInput
 */
function gadgetSpeakResponse (handlerInput) {
    let payload = gadgetUtil.getPayload(handlerInput);
    let gadgetSpeak = payload.speak;

    let sessionToken = gadgetUtil.sessionToken(handlerInput);

    // 永続化用のディレクティブ
    let persistenceDirective = gadgetDirective.sessionPersistence(sessionToken, null);
    // セッション終了用のディレクティブ
    let sessionEndDirective = gadgetDirective.end(sessionToken, null);

    return handlerInput.responseBuilder
        .addDirective(persistenceDirective)
        .addDirective(sessionEndDirective)
        .speak(gadgetSpeak)
        .getResponse();
}

function sessionEndResponse (handlerInput) {
    let payload = gadgetUtil.getPayload(handlerInput);
    let gadgetSpeak = payload.speak;
    return handlerInput.responseBuilder
        .speak(gadgetSpeak)
        .getResponse();
}

/**
 * 時刻選択が行えなかったときの返答文
 *
 * @param {*} handlerInput
 * @returns
 */
function timeSelectErrorResponse (handlerInput) {
    //　時刻がうまく取得できなかったときのレスポンスを生成します
    return handlerInput.responseBuilder
        .speak(language.speekText('LAUNCH_RESPONSE'))
        .getResponse();
}

/**
 * セッション永続化のBlancResponse用
 *
 * @param {*} handlerInput
 */
function sessionPersistenceResponse (handlerInput) {
    let sessionToken = gadgetUtil.sessionToken(handlerInput);

    // 永続化用のディレクティブ
    let persistenceDirective = gadgetDirective.sessionPersistence(sessionToken, null);
    // セッション終了用のディレクティブ
    let sessionEndDirective = gadgetDirective.end(sessionEndDirective, null);

    // ◎時間◎分のセッションを開始しますと読み上げます
    return handlerInput.responseBuilder
        .speak('')
        .addDirective(persistenceDirective)
        .addDirective(sessionEndDirective)
        .getResponse();
}