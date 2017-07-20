'use strict'

const sha1 = require('sha1');
const wechat = require('./wechat.js');
const getRawBody = require('raw-body');
module.exports = function(config){
  return async (ctx, next) => {
    wechat.getAccessToken(config);

    let query = ctx.query;
    let token = config.token;
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
          return false;
      }
      else {
        let msg = await getRawBody(ctx.req, {
          length: ctx.length,
          limit: '1mb',
          encoding: ctx.charset
        });
        console.log(msg.toString());
      }
    }
  }
}