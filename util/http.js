const request = require('request');

/*http同期処理を行う*/
exports.syncRequest = async function (url, headers, method) {
    headers = headers ? headers : {};
    method = method ? method : 'GET';

    const response = function () {
        return new Promise(function (resolve , reject){
            let options = {
                url: url,
                method: method,
                headers: headers
            }
            request(options, function (error , response , body) {
                if(!error) {
                    resolve(body);
                } else {
                    reject(error);
                }
            })
        });
    }
    let res = await response();
    var resDelays = JSON.parse(res);
    return resDelays;
}