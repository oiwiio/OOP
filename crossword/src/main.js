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

let editingWordIndex = null;

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
  crossword.updateGridDisplay();
  
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
      editingWordIndex = null;
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
        if (editingWordIndex !== null) {
          wl.updateWord(editingWordIndex, word, description);
          editingWordIndex = null;
        } else {
          wl.addWord(word, description);
        }
        updateUI();
        wordInput.value = '';
        descriptionInput.value = '';
        addBtn.textContent = 'Добавить';
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

    // выбор слова в таблице для редактирования в этой же форме
    const rows = document.querySelectorAll('.word-list tbody tr');
    const currentWords = wl.getWords();
    rows.forEach((row, index) => {
      row.addEventListener('click', () => {
        const wordText = row.querySelector('td:nth-child(1)').textContent;
        const descriptionText = row.querySelector('td:nth-child(2)').textContent;

        // находим индекс слова в списке (на случай, если порядок изменится)
        const idx = currentWords.findIndex(
          w => w.word === wordText && w.description === descriptionText
        );

        editingWordIndex = idx !== -1 ? idx : index;

        wordInput.value = wordText;
        descriptionInput.value = descriptionText;
        addBtn.textContent = 'Обновить';
      });
    });
  }

  // Управление сеткой теперь происходит при клике по клеткам, обработчики добавлены внутри CrosswordGrid
}


updateUI();