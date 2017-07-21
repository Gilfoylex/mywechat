'use strict'

const sha1 = require('sha1');
const getRawBody = require('raw-body');
const util = require('../libs/util.js');


const perfix = 'https://api.weixin.qq.com/cgi-bin/';
const api = {
  accessToken: perfix + 'token?grant_type=client_credential'
}


var wechat = {};

wechat._isValidAccessToken = (data) => {
  console.log('_isValidAccessToken');
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

wechat.getAccessToken = () => {
  return async (ctx, next) => {
    console.log('getAccessToken~');
    try {
      console.log('getAccessToken2~');
      let result = await util.readFileAsync('./libs/1.txt', 'utf-8');
      let data = JSON.parse(result);

      if (wechat._isValidAccessToken(data)) {
        ctx.wechatConfig.access_token = data.access_token;
        ctx.wechatConfig.expires_in = data.expires_in;
        console.log('getAccessToken3~');
        await next();
      }
      else {
        let appID = ctx.wechatConfig.appID;
        let appSecret = ctx.wechatConfig.appSecret;
        let url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret;
        let data = await util.requestAsync(url);
        console.log(data);
        
        let now = (new Date().getTime());
        let expires_in = now + (data.expires_in -20) * 1000;
        data.expires_in = expires_in;
        ctx.wechatConfig.access_token = data.access_token;
        ctx.wechatConfig.expires_in = expires_in;
        
        await util.writeFileAsync('./libs/1.txt', JSON.stringify(data));

        await next();
      }
    }
    catch (err) {
      console.log(err);
    }
  }
}

wechat.checkRequest = () => {
  return async (ctx, next) => {
    console.log('checkRequest');
    let query = ctx.query;
    let token = ctx.wechatConfig.token;
    let signature = query.signature;
    let nonce = query.nonce;
    let timestamp = query.timestamp;
    let echostr = query.echostr;
    let str = [token, timestamp, nonce].sort().join('');
    let sha = sha1(str);

    if (ctx.method === 'GET') {
      if (sha === signature) {
        ctx.body = echostr + '';
      }
      else {
        ctx.body = 'wrong';
      }
    }
    else if (ctx.method === 'POST') {
      if (sha !== signature) {
          ctx.body = 'wrong';
      }
      else {
        await next();
      }
    }
  }
}

wechat.accpetOrSendMsg = () => {
  return async (ctx, next) => {
    //accept message
    console.log('accpetOrSendMsg~');
    let data = await getRawBody(ctx.req, {
      length: ctx.length,
      limit: '1mb',
      encoding: ctx.charset
    });

    let content = await util.parseXMLAsync(data);
    console.log(content);
    let msg = util.formatMessage(content.xml);
    console.log(msg);
    ctx.wechatMessage = msg;

    //await next();

    //send message

  }
}

wechat.messageHandle = () => {
  return async (ctx, next) => {
    //todo
  }
}

module.exports = wechat;