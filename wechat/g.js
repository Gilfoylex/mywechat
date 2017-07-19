'use strict'

const sha1 = require('sha1');

module.exports = function(config){
  return async (ctx, next) => {
    let query = ctx.query;
    let token = config.token;
    let signature = query.signature;
    let nonce = query.nonce;
    let timestamp = query.timestamp;
    let echostr = query.echostr;
    let str = [token, timestamp, nonce].sort().join('');
    let sha = sha1(str);

    if (sha === signature){
      ctx.body = echostr + '';
    }
    else{
     ctx.body = 'wrong';
    }
  }
}