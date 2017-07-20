'use strict'

const util = require('./util.js');

var test = async () => {
  let a = await util.readFileAsync('./1.txt', 'utf-8');
  a = JSON.parse(a);
  console.log('call time:' + a);
}

test();