const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));
const rl = Promise.promisifyAll(require("readline"));
const Table = require("cli-table");

const Trie = require("./tries");
const i = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
  prompt: "News Article >"
});
const {WORD_FOUND, NOT_COMPLETE_WORD_FOUND} = require('./constants');

const trie = new Trie();
let newsArticle = "";

fs.readFileAsync("companies.dat", "utf-8").then(data => {
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
  i.on("line", line => {
    if (line === ".") {
      // analysis
      //console.log("news article:", newsArticle);
      let hits = getHitCount(newsArticle);
      console.log(hits);
      // let wordCount = calculateWordCount(newsArticle);
      // let stats = calcStats(hits, wordCount);
      // let whatever = table(stats, wordCount);
      end();
    } else {
      newsArticle += line;
      i.prompt();
    }
  });
});

function end() {
  console.log("exiting...");
  i.close();
  process.stdin.destroy();
}

function getHitCount(article) {
	const words = article.split(' ');
	const matches = {};
	let continueFromLastWord;
	words.forEach(word => {
		// TODO stuff for cases like 'Test Test Company'
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

	return matches;
}

//Function to calculate word count
function calculateWordCount(article) {
  if (article) {
    article = article.replace(/(and|the|but|an|or|a)/g, "");
    article = article.replace(
      /(~|`|!|@|#|$|%|^|&|\*|\(|\)|{|}|\[|]|;|:|"|'|<|,|\.|>|\?|\/|\\|\||-|_|\+|=)/g,
      ""
    );
    article = article.split(" ");
    article = article.filter(word => word != "");
    return article.length;
  }
}

//function to calculate important statistics
function calcStats(successfuls, words) {
  let stats = {}; //object containing stats of each company
  let arr = []; //array to hold all companies stats
  let hitCount = 0; //hit count per company name
  let number = 0; //temp number variable -dont worry about this
  let percentage = ""; //percentage template string thingy

  //traverse through the object of successful tries
  //get our company name, hit count, calculate percentage
  for (let company in successfuls) {
    if (successfuls.hasOwnProperty(company)) {
      hitCount = successfuls[company];
      number = (hitCount / words) * 100;
      percentage = `${number}%`;
      stats[company] = percentage;
      stats["hit count"] = hitCount;
      arr.push(stats);
    }
  }
  return arr;
}

//function to turn our values and format it into a nice table format
function table(arr, count) {
  //create headings for table professor wants
  const statsTable = new Table({
    head: ["Company", "Hitcount", "Relevance"],
    colWidths: [30, 30, 30]
  });

  //table for total hits and percentage
  const totalStats = new Table({
    colWidths: [30, 30, 30]
  });

  //table for total words in article
  const wordCountTable = new Table({
    colWidths: [45, 46]
  });

  let company;

  //figure out how to get company names, hitcount, and relevance from array of objects
  //then populate the table dynamically
  for (let item in arr) {
    console.log(arr[item]); // Will display contents of the object inside the array
  }

  //TODO: dynamically add these numbers from whatever DS we use
  statsTable.push(
    ["Apple Inc", "HITCOUNT", "RELEVANCE"],
    ["Microsoft", "HITCOUNT", "RELEVANCE"],
    ["Verizon Wireless", "HITCOUNT", "RELEVANCE"]
  );

  //TODO: total stats in a way where we can get calculations of total hits and percentage of total hits vs. total words
  totalStats.push(["Total", 12, "10%"]);
  //dont need to change anything here
  wordCountTable.push(["Total Words:", count]);

  console.log(statsTable.toString());
  console.log(totalStats.toString());
  console.log(wordCountTable.toString());
}
/*
	Bibliography:
	https://medium.com/@alexanderv/tries-javascript-simple-implementation-e2a4e54e4330
	https://stackoverflow.com/questions/4328500/how-can-i-strip-all-punctuation-from-a-string-in-javascript-using-regex
 */
