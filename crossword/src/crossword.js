export class CrosswordGrid {
    constructor(rows = 10, cols = 10) {
        this.rows = rows;
        this.cols = cols;
        this.grid = this.createEmptyGrid();
        this.placedWords = [];
        this.direction = 'horizontal';
        this.activeCell = null;
        this.isEditMode = false;
        this.wordBeingEdited = null;
        this.inputPanel = null;
        this.wordInputField = null;
        this.directionRadios = [];
        this.selectedCellLabel = null;
        this.panelActionBtn = null;
        this.highlightedCells = [];
    }

    createEmptyGrid() {
        return Array(this.rows).fill().map(() => Array(this.cols).fill(''));
    }

    renderGrid() {
        const template = document.getElementById('crossword-grid');
        const clone = template.content.cloneNode(true);
        const gridContainer = clone.querySelector('#crossword-grid-container');
        
        gridContainer.innerHTML = '';
        
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.textContent = this.grid[i][j] || '';
                cell.addEventListener('click', () => {
                    this.handleCellClick(i, j);
                });
                
                gridContainer.appendChild(cell);
            }
        }

        this.setupPlacementControls(clone);
        
        return clone;
    }

    setupPlacementControls(container) {
        this.inputPanel = container.querySelector('#cell-input-panel');
        this.wordInputField = container.querySelector('#cell-word-input');
        this.directionRadios = container.querySelectorAll('input[name="cell-direction"]');
        this.selectedCellLabel = container.querySelector('#selected-cell-label');
        this.panelActionBtn = container.querySelector('#cell-place-word-btn');

        this.directionRadios.forEach(radio => {
            if (radio.checked) {
                this.direction = radio.value;
            }
            radio.addEventListener('change', (e) => {
                this.setDirection(e.target.value);
                console.log(`Направление изменено на: ${this.direction}`);
            });
        });

        if (this.wordInputField) {
            this.wordInputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.submitWordFromPanel();
                }
            });
        }

        const placeBtn = container.querySelector('#cell-place-word-btn');
        if (placeBtn) {
            placeBtn.addEventListener('click', () => this.submitWordFromPanel());
        }

        const cancelBtn = container.querySelector('#cell-cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.clearSelection());
        }

        const clearBtn = container.querySelector('#clear-placement');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearGrid();
            });
        }
    }

    handleCellClick(row, col) {
        console.log(`Клик по клетке: (${row}, ${col})`);

        // если кликнули по уже размещенному слову — сразу переходим в режим редактирования
        const existingWord = this.getWordAtCell(row, col, this.direction);
        if (existingWord) {
            this.startEditingWord(existingWord);
            return;
        }

        // если слова нет — обычный выбор клетки для нового слова
        this.exitEditMode();
        this.activeCell = { row, col };
        this.showInputPanel(row, col);
        this.highlightSelectedCell(row, col);
    }

    canPlaceWord(word, row, col, direction, wordToIgnore = null) {
        const wordLength = word.length;
        console.log(`Проверка размещения: слово "${word}" длиной ${wordLength} в (${row},${col}) направление: ${direction}`);

        if (direction === 'horizontal') {
            if (col + wordLength > this.cols) {
                console.log('Не помещается по горизонтали');
                return false;
            }
            
            for (let i = 0; i < wordLength; i++) {
                const currentChar = this.grid[row][col + i];
                const isIgnored = wordToIgnore ? this.isCellPartOfWord(row, col + i, wordToIgnore) : false;
                if (!isIgnored && currentChar !== '' && currentChar !== word[i]) {
                    console.log(`Конфликт в позиции (${row},${col + i}): ${currentChar} != ${word[i]}`);
                    return false;
                }
            }
        } else { 
            if (row + wordLength > this.rows) {
                console.log('Не помещается по вертикали');
                return false;
            }
            
            for (let i = 0; i < wordLength; i++) {
                const currentChar = this.grid[row + i][col];
                const isIgnored = wordToIgnore ? this.isCellPartOfWord(row + i, col, wordToIgnore) : false;
                if (!isIgnored && currentChar !== '' && currentChar !== word[i]) {
                    console.log(`Конфликт в позиции (${row + i},${col}): ${currentChar} != ${word[i]}`);
                    return false;
                }
            }
        }

        console.log('Размещение возможно');
        return true;
    }

    placeWord(word, row, col, direction, description = '') {
        const wordObj = {
            word: word,
            row: row,
            col: col,
            direction: direction,
            description: description
        };

        this.placedWords.push(wordObj);

        for (let i = 0; i < word.length; i++) {
            if (direction === 'horizontal') {
                this.grid[row][col + i] = word[i];
            } else {
                this.grid[row + i][col] = word[i];
            }
        }

        console.log(`Слово "${word}" размещено в (${row},${col}) направление: ${direction}`);
    }

    clearGrid() {
        this.grid = this.createEmptyGrid();
        this.placedWords = [];
        this.rebuildGridFromWords();
        this.updateGridDisplay();
        this.clearSelection();
        console.log('Сетка очищена');
    }

    updateGridDisplay() {
        const cells = document.querySelectorAll('.grid-cell');
        
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            cell.textContent = this.grid[row][col] || '';
            cell.classList.remove('selected-cell');
        });

        this.applyHighlightState();
    }

    getGrid() {
        return this.grid;
    }

    getPlacedWords() {
        return this.placedWords;
    }

    addWordDirectly(word, direction, description = '') {
        console.log(`Попытка добавить слово "${word}" направление: ${direction}`);
        
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.canPlaceWord(word, row, col, direction)) {
                    this.placeWord(word, row, col, direction, description);
                    console.log(`Слово "${word}" успешно добавлено в позицию (${row}, ${col})`);
                    return true;
                }
            }
        }
        
        alert(`Не удалось найти подходящее место для слова "${word}" в направлении ${direction === 'horizontal' ? 'горизонтально' : 'вертикально'}`);
        return false;
    }

    showInputPanel(row, col) {
        if (!this.inputPanel) {
            return;
        }

        if (this.selectedCellLabel) {
            this.selectedCellLabel.textContent = `Клетка: ${row + 1}:${col + 1}`;
        }

        if (this.wordInputField) {
            this.wordInputField.focus();
        }

        this.inputPanel.classList.remove('hidden');
    }

    hideInputPanel() {
        if (this.inputPanel) {
            this.inputPanel.classList.add('hidden');
        }
    }

    clearSelection() {
        this.exitEditMode();
        this.activeCell = null;
        this.clearHighlight();
        this.hideInputPanel();
        this.clearInputs();
        if (this.selectedCellLabel) {
            this.selectedCellLabel.textContent = 'Клетка не выбрана';
        }
    }

    highlightSelectedCell(row, col) {
        this.highlightedCells = [{ row, col }];
        this.applyHighlightState();
    }

    highlightWord(wordObj) {
        this.highlightedCells = this.getCellsForWord(wordObj);
        this.applyHighlightState();
    }

    clearHighlight() {
        this.highlightedCells = [];
        this.applyHighlightState();
    }

    applyHighlightState() {
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.classList.remove('selected-cell');
        });

        this.highlightedCells.forEach(({ row, col }) => {
            const cell = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cell.classList.add('selected-cell');
            }
        });
    }

    submitWordFromPanel() {
        if (!this.activeCell) {
            alert('Сначала выберите клетку в сетке');
            return;
        }

        if (!this.wordInputField) {
            return;
        }

        const word = this.wordInputField.value.trim();
        // описания в панели больше нет; при редактировании сохраняем старое описание, если оно было
        const description = (this.isEditMode && this.wordBeingEdited) ? (this.wordBeingEdited.description || '') : '';
        if (!word) {
            alert('Введите слово для размещения');
            return;
        }
        if (this.isEditMode && this.wordBeingEdited) {
            this.updateExistingWord(word, description);
            return;
        }

        if (!this.activeCell) {
            alert('Сначала выберите клетку в сетке');
            return;
        }

        const { row, col } = this.activeCell;

        if (!this.canPlaceWord(word, row, col, this.direction)) {
            alert('Слово нельзя разместить в выбранной клетке и направлении');
            return;
        }

        this.placeWord(word, row, col, this.direction, description);
        this.updateGridDisplay();
        this.clearInputs();
        this.clearSelection();
    }

    selectWordFromList(word, description) {
        if (this.wordInputField) {
            this.wordInputField.value = word || '';
        }
        if (this.panelActionBtn) {
            this.panelActionBtn.textContent = 'Обновить';
        }
    }

    clearInputs() {
        if (this.wordInputField) {
            this.wordInputField.value = '';
        }
        if (this.panelActionBtn) {
            this.panelActionBtn.textContent = 'Добавить';
        }
    }

    rebuildGridFromWords() {
        this.grid = this.createEmptyGrid();
        this.placedWords.forEach(wordObj => {
            const { word, row, col, direction } = wordObj;
            for (let i = 0; i < word.length; i++) {
                if (direction === 'horizontal') {
                    this.grid[row][col + i] = word[i];
                } else {
                    this.grid[row + i][col] = word[i];
                }
            }
        });
    }

   

    setDirection(direction, syncRadios = false) {
        this.direction = direction;
        if (syncRadios && this.directionRadios) {
            this.directionRadios.forEach(radio => {
                radio.checked = radio.value === direction;
            });
        }
    }

    isCellPartOfWord(row, col, wordObj) {
        const { word, direction, row: startRow, col: startCol } = wordObj;
        if (direction === 'horizontal') {
            return row === startRow && col >= startCol && col < startCol + word.length;
        }
        return col === startCol && row >= startRow && row < startRow + word.length;
    }

    getCellsForWord(wordObj) {
        const cells = [];
        const { word, row, col, direction } = wordObj;
        for (let i = 0; i < word.length; i++) {
            if (direction === 'horizontal') {
                cells.push({ row, col: col + i });
            } else {
                cells.push({ row: row + i, col });
            }
        }
        return cells;
    }

    getWordAtCell(row, col, preferredDirection = null) {
        
        if (preferredDirection) {
            const match = this.placedWords.find(wordObj =>
                wordObj.direction === preferredDirection && this.isCellPartOfWord(row, col, wordObj)
            );
            if (match) {
                return match;
            }
        }
       
        return this.placedWords.find(wordObj => this.isCellPartOfWord(row, col, wordObj)) || null;
    }

    startEditingWord(wordObj) {
        this.isEditMode = true;
        this.wordBeingEdited = wordObj;
        this.activeCell = { row: wordObj.row, col: wordObj.col };

        if (this.wordInputField) {
            this.wordInputField.value = wordObj.word || '';
        }
        if (this.panelActionBtn) {
            this.panelActionBtn.textContent = 'Обновить';
        }

        this.setDirection(wordObj.direction, true); 
        this.highlightWord(wordObj);
        this.showInputPanel(wordObj.row, wordObj.col);
    }

    updateExistingWord(newWord, newDescription) {
        if (!this.wordBeingEdited) {
            return;
        }

        const target = this.wordBeingEdited;
        const { row, col } = target;
        const newDirection = this.direction;

        if (!this.canPlaceWord(newWord, row, col, newDirection, target)) {
            alert('Слово нельзя разместить в выбранной клетке и направлении');
            return;
        }

        // обновляем данные слова в массиве
        target.word = newWord;
        target.description = newDescription;
        target.direction = newDirection;

        // перерисовываем сетку с учетом нового слова
        this.rebuildGridFromWords();
        this.updateGridDisplay();
        this.clearInputs();
        this.clearSelection();
    }

    exitEditMode() {
        this.isEditMode = false;
        this.wordBeingEdited = null;
    }
} 

