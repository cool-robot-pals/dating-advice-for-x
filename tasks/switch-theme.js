#!/usr/bin/env node

require('dotenv').config()
const themes = require('./../themes.json');
const pluralize = require('pluralize');
const color = require('word-color');
const redis = require('redis');
const svg_to_png = require('svg-to-png');
const base64Img = require('base64-img');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const rgbHex = require('rgb-hex');
const Twitter = require('twitter');

const chirparino = new Twitter({
	consumer_key: process.env.TWITTER_CK,
	consumer_secret: process.env.TWITTER_CS,
	access_token_key: process.env.TWITTER_TK,
	access_token_secret: process.env.TWITTER_TS
});

const client = redis.createClient(process.env.REDIS_URL);

const assets = ['avi'];

const makeAssets = async (colors) => {
	assets.map(file => {
		const original = path.resolve(__dirname,'..','assets',`${file}.svg`);
		const content = fs.readFileSync(original,'utf8')
			.replace(/#000000/g,'#'+colors[0])
			.replace(/#FFFFFF/g,'#'+colors[1]);
		fs.writeFileSync(path.resolve(__dirname,'..','dist',`${file}.svg`), content);
	});

	return svg_to_png.convert(
		assets.map(_=>path.resolve(__dirname,'..','dist',`${_}.svg`)),
		path.resolve(__dirname,'..','dist')
	,{
		compress: true,
	}).then(()=>
		assets.map(_=>path.resolve(__dirname,'..','dist',`${_}.png`))
	)
};

const main = async () => {
	
	const index = Math.floor(Math.random()*themes.length);
	const theme = themes[index];
	const colors = theme.map(_ => rgbHex(...color.rgb(_)));
		
	const assets = await makeAssets(colors);
	
	const tweet = `Happy Friday! Now dispensing advice for ${pluralize.plural(theme[0])} & ${pluralize.plural(theme[1])}`;
	const username = `Dating advice 💖 [${pluralize.plural(theme[0])} & ${pluralize.plural(theme[1])} week]`.substring(0,50);
	
	Promise.all([
		chirparino.post('account/update_profile_image.json',{
			'image': base64Img.base64Sync(assets[0]).replace('data:image/png;base64,','')
		}),
		chirparino.post('account/update_profile.json',{
			'name': username,
			'profile_link_color': colors[0]
		}),
		chirparino.post('statuses/update', {status: tweet}),
		client.set('last', index)
	]).then(() => {
		console.info(chalk.green(`✔ Updated. ${tweet}`));
	}).catch(err=>{
		console.error(chalk.red('✘ Updating failed'));
		console.error(err);
		throw err;
	}).then(()=>{
		client.quit();
	})
	
}

main();