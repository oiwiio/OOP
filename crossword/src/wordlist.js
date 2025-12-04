export class WordList {
    constructor() {
        this.words = [];
    }

    addWord(word, description) {
        this.words.push({
            word, 
            description 
        });
    }

    updateWord(index, word, description) {
        if (this.words[index]) {
            this.words[index] = { word, description };
        }
    }

    deleteWord(wordToDelete) {
        this.words = this.words.filter(item => item.word !== wordToDelete);
    }

    getWords() {
        return this.words;
    }
    
    findWord(wordText) {
        return this.words.find(word => word.word === wordText);
    }
}