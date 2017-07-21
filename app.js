'use strict'

const koa = require('koa');
const wechat = require('./wechat/wechat.js');

const app = new koa();

const config = {
  wechat: {
    appID: 'wx54df7374b284b873',
    appSecret: 'c8f7aaaae5d54ed7fb33a7f1a80ce7ea',
    token: 'gilfoylewechattest'
  }
};

//time middleware
app.use(async (ctx, next) => {
  const start = new Date();
  ctx.wechatConfig = config.wechat;
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} -- ${ms}ms`);
});

app.use(wechat.getAccessToken());

app.use(wechat.checkRequest());

app.use(wechat.accpetOrSendMsg());

app.use(wechat.messageHandle());

app.listen(3700);

console.log('Listening : 3700');