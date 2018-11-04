const Trie = require('./tries');

const trie = new Trie();

trie.add('bear');
trie.add('bell');
trie.add('bid');
trie.add('bull');
trie.add('buy');

trie.add('sell');
trie.add('stock');
trie.add('stop');

console.log(trie);