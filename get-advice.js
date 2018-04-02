const fs = require('fs');
const rand = require('random-item-in-array');
const shuffle = require('shuffle-array');
const themes = require('./themes.json');

const capitalizeFirstLetter = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const binaryKeywords = [
	{
		'she':'the $1',
		'he':'the $1',
	},
  {
		'her':'the $1',
		'him':'the $1',
	},
  {
		'herself':'themselves',
		'himself':'themselves',
	},
	{
		'hers': 'their',
		'his': 'their',
	},
  {
		'woman':'$1',
		'man':'$1',
	},
  {
		'male':'$1',
		'female':'$1',
	},
  {
		'sex':'group',
    'sex':'group',
	},
  {
		'women':'$1s',
		'men':'$1s',
	},
  {
		'wife':'$1s',
		'husband':'$1s',
	},
	{
		'martians':'$1s',
		'venusians':'$1s',
	},
	{
		'martian':'$1',
		'venusian':'$1',
	},
	{
		'partner':'$1',
		'partner':'$1',
	},
	{
		'partners':'$1s',
		'partners':'$1s',
	},
	{
		'venus':'the land of $1s',
		'mars':'the land of $1s',
	},
];

const makeWordRegex = (words) => {
  return new RegExp('\\b('+words.join('|')+')\\b','g');
}

const text = fs.readFileSync('./corpus.txt', 'utf8').split("\n\n")
	.map(_ => _.replace(/\n/g,''))
	.filter(_ => _.length > 64)
	.filter(_ =>
    binaryKeywords.map(
      k => makeWordRegex(Object.keys(k)).test(_)
    ).some(_ => _ === true)
	)

let passage = rand(text);

const transforms = [
  {
    in: _ => _,
    out: _ => _,
  },
  {
    in: capitalizeFirstLetter,
    out: _ => _.toLowerCase(),
  },
]

const getPart = async (themeIndex) => {
  
  const theme = shuffle(themes[themeIndex]);
  
  binaryKeywords.forEach(pair => {

    transforms.forEach(transform => {
      const regex = makeWordRegex(Object.keys(pair).map(transform.in));
      const replacer = match => {
        const index = Object.keys(pair).indexOf(transform.out(match));
        return pair[transform.out(match)].replace('$1',transform.in(theme[index]))
      };
      passage = passage.replace(regex, replacer);
    })
  });

  const pieces = passage.split('.').map(_ => _.trim()).reverse().reduce((acc,piece)=>
    (acc.join('. ').length + piece.length > 278)
    ? acc
    : [...acc, piece]
  ,[]).reverse();

  return capitalizeFirstLetter(pieces.join('. '));

}

module.exports = getPart;