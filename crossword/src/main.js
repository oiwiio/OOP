import './style.css'
import { renderWordList } from './renderers.js';
import { WordList } from './wordlist.js';
import { CrosswordGrid } from './crossword.js';

const root = document.querySelector("#root");

root.innerHTML =`
  <div id="app">
    <div class="app-container">
      <div class="words-section" id="words-section"></div>
      <div class="crossword-section" id="crossword-section"></div>
    </div>
  </div>
`;

const app = root.querySelector('#app');
const crosswordSection = app.querySelector('#crossword-section');
const wordsSection = app.querySelector('#words-section');

const wl = new WordList();
const crossword = new CrosswordGrid();

wl.addWord("повар", "такая профессия");
wl.addWord("чай", "вкусный, делает меня человеком");
wl.addWord("яблоки", "с ананасами");
wl.addWord("сосисочки", "я — Никита Литвинков!");

let selectedWord = null;

function updateUI() {
  wordsSection.innerHTML = '';
  wordsSection.appendChild(renderWordList(wl));
  
  const formTemplate = document.getElementById('add-form-template');
  wordsSection.appendChild(formTemplate.content.cloneNode(true));
  
  crosswordSection.innerHTML = '';
  crosswordSection.appendChild(crossword.renderGrid());
  
  setupEventListeners();
}

function setupEventListeners() {
  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      const row = this.closest('tr');
      const wordText = row.querySelector('td:first-child').textContent;
      wl.deleteWord(wordText);
      
      if (selectedWord && selectedWord.word === wordText) {
        selectedWord = null;
      } 

      updateUI();
    });
  }); 

  const wordRows = document.querySelectorAll('.word-list tbody tr');
  wordRows.forEach(row => {
    row.addEventListener('click', function() {
      const wordText = this.querySelector('td:first-child').textContent;
      const wordObj = wl.getWords().find(w => w.word === wordText);
      if (wordObj) {
        selectedWord = wordObj;
        crossword.setWordForPlacement(wordObj);
        
        wordRows.forEach(r => r.classList.remove('selected'));
        this.classList.add('selected');
        
        console.log(`Выбрано слово: "${wordText}"`);
      }
    });
  });

  const addBtn = document.getElementById('add-btn');
  const wordInput = document.getElementById('word-input');
  const descriptionInput = document.getElementById('description-input');

  addBtn.addEventListener('click', function(){
    const word = wordInput.value.trim();
    const description = descriptionInput.value.trim();

    if (word && description){
      wl.addWord(word, description);
      updateUI();
      wordInput.value = '';
      descriptionInput.value = '';
    }
  });
}


updateUI();