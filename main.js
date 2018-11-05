const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const rl = Promise.promisifyAll(require('readline'));

const Trie = require('./tries');
const i = rl.createInterface({input: process.stdin, output: process.stdout, terminal: true, prompt: 'News Article >'});

const trie = new Trie();

let newsArticle = '';

fs.readFileAsync('companies.dat', 'utf-8').then(data => {
	const companies = data.split('\n');
	const companiesAndNicknames = companies.map((company) => {
		return company.split('\t');
	})

	companiesAndNicknames.map((pseudonyms, id) => {
		pseudonyms.map(pseudonym => {
			trie.add(pseudonym, id);
		})
	});

	i.prompt();
	i.on('line', line => {
		if (line === '.') {
			// analysis
			console.log('news article:', newsArticle);
			// const words = newsArticle.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
			end();
		} else {
			newsArticle += line;
			i.prompt();
		}
	})
});

function end() {
	console.log('exiting...');
	i.close();
	process.stdin.destroy();
}

/*
	Bibliography:
	https://medium.com/@alexanderv/tries-javascript-simple-implementation-e2a4e54e4330
	https://stackoverflow.com/questions/4328500/how-can-i-strip-all-punctuation-from-a-string-in-javascript-using-regex
 */
