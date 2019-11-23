const skilUtil = require('../util/skil-util');
const gadgetUtil = require('../util/gadget-tool-util');

const gadgetDirective = require('../directive/gadgetDirectiveFactory.js');

module.exports = {
    timeSelectHandler: timeSelectHandler,
    remainingTimeResponse: remainingTimeResponse,
    gadgetEventHandler: gadgetEventHandler
}

async function timeSelectHandler (handlerInput) {
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
        timeSpeechText = hour + '時間';
    }
    if (minute) {
        addMinute += Number(minute);
        timeSpeechText = timeSpeechText + minute + '分';
    }
    
    // 現在の時刻オブジェクトを生成する
    let timerDate = new Date();
    // セッション時間を加算して終了時刻にする
    timerDate.setMinutes(timerDate.getMinutes() + addMinute);

    let endPoints = await gadgetUtil.gadgetEndPoints(handlerInput);

    if (0 < endPoints.length) {
        let sessionToken = await gadgetUtil.sessionToken(handlerInput);

        // 今回は接続されているEndPointのうち0番目のgadgetを利用する
        let sendEndPoint = endPoints[0];
        let sendEndPointId = sendEndPoint.endpointId;
        // gadget側でSession開始を検出するためのディレクティブ
        let sessionStartDirective = gadgetDirective.start(sendEndPointId, timerDate.getTime());

        // SessionAttributeに終了時刻を登録する
        const attributesManager = handlerInput.attributesManager;
        let sessionAttributes = attributesManager.getSessionAttributes();
        sessionAttributes.endDate = timerDate.toUTCString();
        attributesManager.setSessionAttributes(sessionAttributes);

        // 永続化用のディレクティブ
        // このタイミングでのみ付与する
        let persistenceDirective = gadgetDirective.sessionPersistence(sessionToken, null);

        // ◎時間◎分のセッションを開始しますと読み上げます
        return handlerInput.responseBuilder
            .speak(timeSpeechText + 'のセッションを開始します')
            .addDirective(sessionStartDirective)
            .addDirective(persistenceDirective)
            .getResponse();
        
    }else{
        return handlerInput.responseBuilder
            .withShouldEndSession(true)
            .speak('Echoデバイスに接続されているガジェットが見つかりませんでした。ガジェットとの接続を確認した後、再度スキルを呼び出してみてください。')
            .getResponse();  
    }

}

function remainingTimeResponse (handlerInput) {
    let sessionToken = gadgetUtil.sessionToken(handlerInput);
    // 永続化用のディレクティブ
    let persistenceDirective = gadgetDirective.sessionPersistence(sessionToken, null);

    // 現在の時刻オブジェクトを生成する
    const attributesManager = handlerInput.attributesManager;
    let sessionAttributes = attributesManager.getSessionAttributes();
    let endDateString = sessionAttributes.endDate;
    if (endDateString) {
        let timerDate = new Date();
        let endDate = new Date(endDateString);

        let diff = (endDate.getTime() - timerDate.getTime()) / 1000;
        let minitesLeft = (Math.floor(diff / 60)) % 60;
        let hoursLeft = (Math.floor(diff / (60 * 60))) % 24;

        let speakString = "";
        if (0 < hoursLeft) {
            speakString = speakString + hoursLeft + "時間";
        }
        if (0 < minitesLeft) {
            speakString = speakString + minitesLeft + "分";
        }

        // ◎時間◎分のセッションを開始しますと読み上げます
        return handlerInput.responseBuilder
            .speak('残り、' + speakString)
            .addDirective(persistenceDirective)
            .getResponse();
    }else{
        return handlerInput.responseBuilder
            .speak('')
            .addDirective(persistenceDirective)
            .getResponse();
    }
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
        .speak('時刻がうまく取得することができませんでした。')
        .getResponse();
}

function gadgetEventHandler (handlerInput) {
    let payload = gadgetUtil.getPayload(handlerInput);
    let status = payload.status;
    console.log(status);
    console.log(payload);
    if (status == "end") {
        return sessionEndResponse(handlerInput);
    }else{
        return sessionPersistenceResponse(handlerInput);
    }
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
    // ◎時間◎分のセッションを開始しますと読み上げます
    return handlerInput.responseBuilder
        .speak("永続処理中です")
        .addDirective(persistenceDirective)
        .getResponse();
}

/**
 *　セッション終了のResponse
 *
 * @param {*} handlerInput
 * @returns
 */
function sessionEndResponse (handlerInput) {
    return handlerInput.responseBuilder
        .speak("セッション終了です。登壇ありがとうございました！")
        .withShouldEndSession(true)
        .getResponse();
}