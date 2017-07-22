'use strict'

const fs = require('fs');
const request = require('request');
const xml2js = require('xml2js');
const tpl = require('./tpl.js');


var util = {};

util.readFileAsync = (fpath, encoding) => {
  return new Promise((resolve, reject) => {
    fs.readFile(fpath, encoding, (err, content) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(content);
      }
    });
  });
}

util.writeFileAsync = (fpath, content) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(fpath, content, (err) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(content);
      }
    });
  });
}

util.requestAsync = (url) => {
  return new Promise((resolve, reject) => {
    request({url: url, json: true}, (err, response, body) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(body);
      }
    });
  });
}

util.parseXMLAsync = (xml) => {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, {tirm: true}, (err, content) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(content);
      }
    });
  });
}

util.formatMessage = (result) => {
  let message = {};

  if (typeof result === 'object') {
    let keys = Object.keys(result);

    for (let i = 0; i< keys.length; i++) {
      let item = result[keys[i]];
      let key = keys[i];

      if (!(item instanceof Array) || item.length === 0) {
        continue;
      }

      if (item.length === 1) {
        let val = item[0];

        if (typeof val === 'object') {
          message[key] = util.formatMessage(val);
        }
        else {
          message[key] = (val || '').trim();
        }
      }
      else {
        message[key] = []

        for (let j = 0; j < item.length; j++){
          message[key].push(util.formatMessage(item[j]));
        }
      }
    }
  }

  return message;
}

util.tpl = (content, message) => {
  let info = {};
  let type = 'text';
  let fromUserName = message.FromUserName;
  let toUserName = message.ToUsername;

  if (Array.isArray(content)) {
    type = 'news';
  }

  type = content.type || type;

  info.content = content;
  info.createTime = new Date().getTime();
  info.msgType = type;
  info.toUserName = fromUserName;
  info.fromUserName = toUserName;

  return tpl.compiled(info);
}

module.exports = util;