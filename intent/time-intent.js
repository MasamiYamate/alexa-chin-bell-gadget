const skilUtil = require('../util/skil-util');

const gadgetDirective = require('../directive/gadgetDirectiveFactory.js');
const language = require('../language/manager.js');

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

    // ◎時間◎分のセッションを開始しますと読み上げます
    return handlerInput.responseBuilder
        .speak(timeSpeechText + language.speekText('TIME_SELECT_RESPONSE'))
        .addDirective(sendGadgetDirective)
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