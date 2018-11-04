const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const rl = require('readline');

const Trie = require('./tries');
const i = rl.createInterface({input: process.stdin, output: process.stdout, terminal: true});

const trie = new Trie();

fs.readFileAsync('companies.dat', 'utf-8').then(data => {
  const companies = data.split('\n');
  const companiesAndNicknames = companies.map((company) => {
    return company.split('\t');
  })
  console.log(companiesAndNicknames);

  i.question('Enter a news article\n', newsArticle => {
    console.log('you entered', newsArticle);
    end();
  });
});

function end() {
  console.log('exiting...');
  i.close();
  process.stdin.destroy();
}
