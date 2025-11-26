export class CrosswordGrid {
    constructor(rows = 10, cols = 10) {
        this.rows = rows;
        this.cols = cols;
        this.grid = this.createEmptyGrid();
        this.placedWords = [];
        this.selectedWord = null;
        this.direction = 'horizontal';
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
        const directionRadios = container.querySelectorAll('input[name="direction"]');
        directionRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.direction = e.target.value;
                console.log(`Направление изменено на: ${this.direction}`);
            });
        });

        const clearBtn = container.querySelector('#clear-placement');
        clearBtn.addEventListener('click', () => {
            this.clearPlacement();
        });
    }

    handleCellClick(row, col) {
        console.log(`Клик по клетке: (${row}, ${col}), выбрано слово:`, this.selectedWord);
        
        if (!this.selectedWord) {
            console.log('Слово не выбрано для размещения');
            return;
        }

        const word = this.selectedWord.word;
        console.log(`Пытаемся разместить слово "${word}" в (${row},${col}) направление: ${this.direction}`);

        const canPlace = this.canPlaceWord(word, row, col, this.direction);

        if (canPlace) {
            this.placeWord(word, row, col, this.direction);
            this.selectedWord = null;
            this.updateGridDisplay();
            
            const selectedRows = document.querySelectorAll('.word-list tr.selected');
            selectedRows.forEach(row => row.classList.remove('selected'));
            
            console.log('Слово успешно размещено!');
        } else {
            alert('Нельзя разместить слово здесь! Проверьте границы сетки и пересечения.');
        }
    }

    canPlaceWord(word, row, col, direction) {
        const wordLength = word.length;
        console.log(`Проверка размещения: слово "${word}" длиной ${wordLength} в (${row},${col}) направление: ${direction}`);

        if (direction === 'horizontal') {
            if (col + wordLength > this.cols) {
                console.log('Не помещается по горизонтали');
                return false;
            }
            
            for (let i = 0; i < wordLength; i++) {
                const currentChar = this.grid[row][col + i];
                if (currentChar !== '' && currentChar !== word[i]) {
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
                if (currentChar !== '' && currentChar !== word[i]) {
                    console.log(`Конфликт в позиции (${row + i},${col}): ${currentChar} != ${word[i]}`);
                    return false;
                }
            }
        }

        console.log('Размещение возможно');
        return true;
    }

    placeWord(word, row, col, direction) {
        const wordObj = {
            word: word,
            row: row,
            col: col,
            direction: direction
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

    clearPlacement() {
        this.selectedWord = null;
        this.selectedCell = null;
        
        const selectedRows = document.querySelectorAll('.word-list tr.selected');
        selectedRows.forEach(row => row.classList.remove('selected'));
        
        this.updateGridDisplay();
        console.log('Размещение отменено');
    }

    setWordForPlacement(wordObj) {
        this.selectedWord = wordObj;
        console.log(`Выбрано слово для размещения: "${wordObj.word}"`);
    }

    updateGridDisplay() {
        const cells = document.querySelectorAll('.grid-cell');
        
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            cell.textContent = this.grid[row][col] || '';
            cell.className = 'grid-cell';
        });

        this.placedWords.forEach(placedWord => {
            const { word, row, col, direction } = placedWord;
            
            for (let i = 0; i < word.length; i++) {
                let cellRow = row;
                let cellCol = col;
                
                if (direction === 'horizontal') {
                    cellCol = col + i;
                } else {
                    cellRow = row + i;
                }
                
                const cell = document.querySelector(`.grid-cell[data-row="${cellRow}"][data-col="${cellCol}"]`);
                if (cell) {
                    cell.classList.add(direction === 'horizontal' ? 'placed-horizontal' : 'placed-vertical');
                }
            }
        });
    }

    getGrid() {
        return this.grid;
    }

    getPlacedWords() {
        return this.placedWords;
    }
}