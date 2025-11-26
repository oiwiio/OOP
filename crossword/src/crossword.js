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
        console.log(`Клик по клетке: (${row}, ${col})`);
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

    clearGrid() {
        this.grid = this.createEmptyGrid();
        this.placedWords = [];
        this.updateGridDisplay();
        console.log('Сетка очищена');
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

    addWordDirectly(word, direction) {
        console.log(`Попытка добавить слово "${word}" направление: ${direction}`);
        
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.canPlaceWord(word, row, col, direction)) {
                    this.placeWord(word, row, col, direction);
                    console.log(`Слово "${word}" успешно добавлено в позицию (${row}, ${col})`);
                    return true;
                }
            }
        }
        
        alert(`Не удалось найти подходящее место для слова "${word}" в направлении ${direction === 'horizontal' ? 'горизонтально' : 'вертикально'}`);
        return false;
    }
} 

