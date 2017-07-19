'use strict'

const koa = require('koa');
const sha1 = require('sha1');
const app = new koa();

var config = {
  wechat: {
    appID: 'wx54df7374b284b873',
    appSecret: 'c8f7aaaae5d54ed7fb33a7f1a80ce7ea',
    token: 'gilfoylewechattest'
  }
};

app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} -- ${ms}ms`);
});

app.use(async (ctx, next) => {
  let query = ctx.query;
  let token = config.wechat.token;
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
});

app.listen(3700);
console.log('Listening : 3700');