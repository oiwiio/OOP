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
      updateUI();
    });
  }); 

  // Обработчики для формы добавления слов в список
  const addBtn = document.getElementById('add-btn');
  const wordInput = document.getElementById('word-input');
  const descriptionInput = document.getElementById('description-input');

  if (addBtn && wordInput && descriptionInput) {
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

    // Обработчик Enter для полей ввода
    wordInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        descriptionInput.focus();
      }
    });

    descriptionInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        addBtn.click();
      }
    });
  }

  // Обработчики для добавления слов в сетку
  const addWordBtn = document.getElementById('add-word-btn');
  const wordInputField = document.getElementById('word-input-field');
  const clearBtn = document.getElementById('clear-placement');

  if (addWordBtn && wordInputField) {
    function addWordToGrid() {
      const word = wordInputField.value.trim().toUpperCase();
      const direction = document.querySelector('input[name="direction"]:checked').value;
      
      if (word) {
        const success = crossword.addWordDirectly(word, direction);
        if (success) {
          wordInputField.value = '';
          updateUI();
        }
      } else {
        alert('Пожалуйста, введите слово для добавления в сетку');
      }
    }

    addWordBtn.addEventListener('click', addWordToGrid);
    
    wordInputField.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        addWordToGrid();
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      crossword.clearGrid();
    });
  }
}


updateUI();