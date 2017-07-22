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
    try {
      let result = await util.readFileAsync('./libs/1.txt', 'utf-8');
      let data = JSON.parse(result);

      if (wechat._isValidAccessToken(data)) {
        ctx.wechatConfig.access_token = data.access_token;
        ctx.wechatConfig.expires_in = data.expires_in;
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

    await next();

    //send message
    let content2 = ctx.body || '';
    let message = ctx.wechatMessage;
    let xml = util.tpl(content2, message);

    ctx.status = 200;
    ctx.type = 'appliction/xml';
    ctx.body = xml;
  }
}

wechat.messageHandle = () => {
  return async (ctx, next) => {
    const message = ctx.wechatMessage;

    if (message.MsgType === 'event') {
      if (message.Event === 'subscribe') {
        if (message.EventKey) {
          console.log('join with scan' + message.EventKey);

        }

        ctx.body = 'hello, welcome';
      }
      else if (message.Event === 'unsubscribe') {
        console.log('unsubscribe');
        ctx.body = '';
      }
      else if (message.Event = 'LOCATION') {
        console.log('Your location is: ' + message.Latitude + '/'
          + message.Longitude + '-' + message.Precision);

        ctx.body = 'Your location is: ' + message.Latitude + '/'
          + message.Longitude + '-' + message.Precision;
      }
      else if (message.Event === 'CLICK') {
        ctx.body = 'You clicked :' + message.EventKey;
      }
      else if (message.Event === 'SCAN') {
        console.log("scan after subscribe" + message.EventKey + ' ' + message.Ticket);
        ctx.body = 'look you scan';
      }
    }
    else if (message.MsgType === 'text') {
      let content = message.Content;
      let reply = 'oh, you say ' + message.Content + ' too complex';

      if (content === '1') {
        reply = 'first';
      }
      else if (content === '2') {
        reply = 'second';
      }
      else if (content === '3') {
        reply = 'thired';
      }
      else if (content === '4') {
        reply = 'fourth';
      }
      else {

      }

      ctx.body = reply;
    }
    else if (message.MsgType === 'location'){
      console.log('Your location is: ' + message.Location_X + '/'
        + message.Location_Y + '-' + message.Label);

      ctx.body = 'Your location is: ' + message.Location_X + '/'
        + message.Location_Y + '-' + message.Label;
    }
  }
}

module.exports = wechat;