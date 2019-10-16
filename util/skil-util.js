module.exports = {
    checkIntentTypeName: checkIntentTypeName,
    slotValue: slotValue
}

//インテントタイプ、インテント名が一致しているか確認し返却します
function checkIntentTypeName(handlerInput, typeName, intentName) { 
    let request = handlerInput.requestEnvelope.request;
    let isMatch = false;
    //インテントタイプのチェックを行う
    if (typeName && request.type === typeName) {
        isMatch = true;
    } else {
        isMatch = false;
    }
    //リクエストインテント名のチェックを行う
    if (intentName) {
        if (request.intent && request.intent.name === intentName) {
            isMatch = true;
        } else { 
            isMatch = false;
        }
    }
    return isMatch;
}

//スロットのKeyを元に
function slotValue(handlerInput, slotName, isDebugMode) {
    let request = handlerInput.requestEnvelope.request;
    if (request && slotName) {
        let slots = request.intent.slots;
        let item = slots[slotName];
        if (item) {
            let resolutions = item.resolutions;
            if (resolutions) {
                for (let i in resolutions['resolutionsPerAuthority']) {
                    let resolutionsPerAuthority = resolutions['resolutionsPerAuthority'][i];
                    let status = resolutionsPerAuthority['status'];
                    let code = status['code'];
                    if (code == "ER_SUCCESS_MATCH") {
                        let responseValue = null;
                        let values = resolutionsPerAuthority['values'];
                        for (let j in values) {
                            let value = values[j];
                            let name = value['value']['name'];
                            if (name) {
                                responseValue = name;
                                break
                            }
                        }
                        return responseValue;
                    } else if (isDebugMode) {
                        return item.value;
                    }
                }
            }else{
                if (item.value) {
                    return item.value;
                }
            }
        }
    }
    return null;
}