'use strict'

var util = {};

const fs = require('fs');
const request = require('request');

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

module.exports = util;