const {WORD_FOUND, NOT_COMPLETE_WORD_FOUND, WORD_NOT_FOUND} = require('./constants');

function Trie() {
  this.head = {
    key: "",
    children: {}
  };
}

let lastNode;

/**
 * Function to add a new word to the Trie
 */
Trie.prototype.add = function(key, companyId) {
  // Remove all spaces in word when adding
  key = key.trim().replace(/ /g, "");
  // Remove all punctuation when adding
  key = key.trim().replace(/(~|`|!|@|#|$|%|^|&|\*|\(|\)|{|}|\[|]|;|:|"|'|<|,|\.|>|\?|\/|\\|\||-|_|\+|=)/g, "");

  // curNode will be used to traverse trie;
  // newNode is the new node that will be created (if needed)
  // curChar is the value of the character we need to check against when traversing

  let curNode = this.head;
  let newNode = null;

  let curChar = key.slice(0, 1);
  key = key.slice(1);

  // While the curNode has children that includes the curChar, and as long as the curChar exists, advance everything
  while (curNode.children[curChar] !== undefined && curChar.length > 0) {
    curNode = curNode.children[curChar];
    curChar = key.slice(0, 1);
    key = key.slice(1);
  }

  // If, at this point, the char length is 0, this whole string is already in the trie, so update endOfWord to true
  if (curChar.length === 0) {
    curNode.endOfWord = true;
  }

  // If we reached the end of Trie, create new nodes to extend Trie until all characters are added
  while (curChar.length > 0) {
    newNode = {
      key: curChar,
      companyId,
      endOfWord: key.length === 0,
      children: {}
    };

    curNode.children[curChar] = newNode;
    curNode = newNode;

    curChar = key.slice(0, 1);
    key = key.slice(1);
  }
};

/**
 * Search for a word in the Tries
 */
Trie.prototype.search = function(key, useLastNode) {
  let curNode;
  if (useLastNode) {
    curNode = lastNode;
  } else {
    lastNode = undefined;
    curNode = this.head;
  }
  let curChar = key.slice(0, 1);

  key = key.slice(1);

  while (curNode.children[curChar] !== undefined && curChar.length > 0) {
    curNode = curNode.children[curChar];
    curChar = key.slice(0, 1);
    key = key.slice(1);
  }

  // Return TRUE if we are the end of the string (i.e. all the characters were found in the Trie tree)
  // AND if this is the end of the word
    if (curChar.length === 0 && curNode.endOfWord) {
      // If we have gone through the entire word, AND the current node has endOfWord = true, then the word is found
      return {
        type: WORD_FOUND,
        companyId: curNode.companyId
      };
    } else if (curChar.length === 0 && !curNode.endOfWord && curNode.children !== undefined) {
      // If we have gone through the entire word
      // AND it's not the end of the word
      // BUT the current node has more children,
      // that means that it is not the end of the word, but the next word could be added on to this node.
      // Therefore, the next word should continue where this left off.
      lastNode = curNode;
      return {
        type: NOT_COMPLETE_WORD_FOUND
      }
    } else {
      return {
        type: WORD_NOT_FOUND
      };
    }
};

module.exports = Trie;
