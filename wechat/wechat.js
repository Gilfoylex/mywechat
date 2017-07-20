'use strict'

const util = require('../libs/util.js');

var wechat = {};

const perfix = 'https://api.weixin.qq.com/cgi-bin/';
const api = {
  accessToken: perfix + 'token?grant_type=client_credential'
}

const _isValidAccessToken = (data) => {
  if (!data || !data.access_token || !data.expires_in) {
    return false;
  }

  let expires_in = data.expires_in;
  let now = (new Date().getTime());

  if (now < expires_in) {
    return true;
  }
  else {
    return false;
  }
}

wechat.getAccessToken = async (opt) => {
  try {
    let result = await util.readFileAsync('./libs/1.txt', 'utf-8');
    let data = JSON.parse(result);

    if (_isValidAccessToken(data)) {
      opt.access_token = data.access_token;
      opt.expires_in = data.expires_in;
    }
    else {
      let appID = opt.appID;
      let appSecret = opt.appSecret;
      let url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret;
      let data = await util.requestAsync(url);

      if (_isValidAccessToken(data)) {
        let now = (new Date().getTime());
        let expires_in = now + (data.expires_in -20) * 1000;
        data.expires_in = expires_in;
        opt.access_token = data.access_token;
        opt.expires_in = expires_in;
        await util.writeFileAsync('./libs/1.txt', JSON.stringify(data));
      }
    }
  }
  catch (e) {
    console.log(e);
  }
}

module.exports = wechat;