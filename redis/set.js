#!/usr/bin/env node

require('dotenv').config();
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const commandLineArgs = require('command-line-args')
const optionDefinitions = [
	{ name: 'to', alias: 't', type: Number, defaultOption: true }
];
const options = commandLineArgs(optionDefinitions);

client.on('error', function (err) {
	console.log('Error ' + err);
});

client.set('last', options.to ? options.to : 0, redis.print);
