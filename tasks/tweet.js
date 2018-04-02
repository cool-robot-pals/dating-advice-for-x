#!/usr/bin/env node

require('dotenv').config()
const themes = require('./../themes.json');
const redis = require('redis');
const chalk = require('chalk');
const advice = require('./../get-advice.js');
const Twitter = require('twitter');

const chirparino = new Twitter({
	consumer_key: process.env.TWITTER_CK,
	consumer_secret: process.env.TWITTER_CS,
	access_token_key: process.env.TWITTER_TK,
	access_token_secret: process.env.TWITTER_TS
});

const client = redis.createClient(process.env.REDIS_URL);

const main = async () => {
	
	const index = await new Promise((yay,nay) => {
		client.get('last', function(err, reply) {
			if(err) {
				console.error(err);
				client.set('last', 0, redis.print);
				nay();
			}
			else {
				yay(reply);
			}
			client.quit();
		});
	})
	
	const tweet = await advice(index);
	
	Promise.all([
		chirparino.post('statuses/update', {status: tweet}),
	]).then(() => {
		console.info(chalk.green(`✔ Updated. ${tweet}`));
	}).catch(err=>{
		console.error(chalk.red('✘ Updating failed'));
		console.error(err);
		throw err;
	})
}

main();