const Promise = require("bluebird");
const Table = require("cli-table");

const fs = Promise.promisifyAll(require("fs"));
const rl = Promise.promisifyAll(require("readline"));

const Trie = require("./tries");
const {WORD_FOUND, NOT_COMPLETE_WORD_FOUND} = require('./constants');

const i = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
  prompt: "News Article >"
});

const trie = new Trie();
let newsArticle = "";

//TODO use async await

async function start() {
	const data = await fs.readFileAsync("companies.dat", "utf-8");

	const companies = data.split("\n");
	const companiesAndNicknames = companies.map(company => {
		return company.split("\t");
	});

	companiesAndNicknames.map((pseudonyms, id) => {
		pseudonyms.map(pseudonym => {
			trie.add(pseudonym, id);
		});
	});

	i.prompt();
	i.on("line", async line => {
		if (line === ".") {
			let {matches, totalWords} = getTableInformation(newsArticle);
			let stats = calcStats(matches, totalWords);
			await table(stats, totalWords);
			end();
		} else {
			newsArticle += line;
			i.prompt();
		}
	});
}

/**
 * Function to actually go through trie and find matches
 *
 * @param article The news article to search through
 * @returns {{totalWords: number, matches: object}}
 */
function getTableInformation(article) {
	const words = article.split(' ');
	const matches = {};
	let continueFromLastWord;
	let totalWords = 0;
	words.forEach(word => {
		if (!['a', 'an', 'the', 'and', 'or', 'but'].includes(word)) {
			totalWords++;
		}
		const {type, companyId} = trie.search(word, continueFromLastWord);
		continueFromLastWord = false;
		if (type === WORD_FOUND) {
			// If the word is found, add it to matches
			matches[companyId] = (matches[companyId] || 0) + 1;
		} else if (type === NOT_COMPLETE_WORD_FOUND) {
			// If the word is not found, hold the word and continue searching the trie at that point for the word
			continueFromLastWord = true;
		}
	});

	return {
		totalWords,
		matches
	};
}

//function to calculate important statistics
function calcStats(matches, words) {
  let stats = {}; //object containing stats of each company
  let totalHitCount = 0;

  //traverse through the object of successful tries
  //get our company name, hit count, calculate percentage
  for (let companyId in matches) {
    if (matches.hasOwnProperty(companyId)) {
      let hitCount = matches[companyId];
      totalHitCount += hitCount;
      const number = (hitCount / words) * 100;
      const relevance = `${number}%`;
      stats[companyId] = {
      	relevance,
		hitCount
      }
    }
  }
  stats['totalRelevance'] = `${(totalHitCount / words) * 100}%`;
  stats['totalHitCount'] = totalHitCount;
  return stats;
}

//function to turn our values and format it into a nice table format
async function table(stats, count) {
  const statsTable = new Table({
    head: ["Company", "Hit Count", "Relevance"],
    colWidths: [30, 30, 30]
  });

  //table for total hits and percentage
  const totalStats = new Table({
    colWidths: [30, 30, 30]
  });

  //table for total words in article
  const wordCountTable = new Table({
    colWidths: [45, 45]
  });

  const companiesString = await fs.readFileAsync("companies.dat", "utf-8");
  const companies = companiesString.split('\n');
  const primaryCompanyNames = companies.map(company => {
  	return company.split("\t")[0];
  });

  primaryCompanyNames.forEach((primaryCompanyName, id) => {
  	const companyInformation = stats[`${id}`];
  	statsTable.push([
  		primaryCompanyName,
		companyInformation ? companyInformation.hitCount : '0',
		companyInformation ? companyInformation.relevance : '0%']);
  });
  totalStats.push(["Total", stats.totalHitCount, stats.totalRelevance]);
  wordCountTable.push(["Total Words:", count]);

  console.log(statsTable.toString());
  console.log(totalStats.toString());
  console.log(wordCountTable.toString());
}

function end() {
	i.close();
	process.stdin.destroy();
}

start();
/*
	Bibliography:
	https://medium.com/@alexanderv/tries-javascript-simple-implementation-e2a4e54e4330
	https://stackoverflow.com/questions/4328500/how-can-i-strip-all-punctuation-from-a-string-in-javascript-using-regex
 */
