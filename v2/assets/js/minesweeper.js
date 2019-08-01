const uiContainers = {
    gameControls: null,
    difficultyContainer: null,
    infoContainer: null,
    gameBoard: null
}


const uiComponents = {
    difficultySelector: null,
    flagCount: null,
    timer: null
}

const boardDimensions = {
    easy: {
        rows: 8,
        cols: 10,
        grid: 80,
        mines: 10
    },
    medium: {
        rows: 14,
        cols: 18,
        grid: 252,
        mines: 40

    },
    hard: {
        rows: 20,
        cols: 24,
        grid: 480,
        mines: 99
    }
}


const gameBoardLogicRep = [];
const GAME_STATE = {
    mineCoordinateSet: null,
    hiddenCells: 0
};


function initGameState() {
    GAME_STATE.mineCoordinateSet = new Set([]);
}


function resetGameUi () {
    //reset components
    uiComponents.difficultySelector = null;
    uiComponents.flagCount = null;
    uiComponents.timer = null;

    //reset containers
    uiContainers.gameControls = null;
    uiContainers.difficultyContainer = null;
    uiContainers.infoContainer = null;
    uiContainers.gameBoard = null;
    
    //clear the DOM
    $('main').empty();
}


function initGameUi(difficulty) {
    //UI DOM Containers
    uiContainers.gameControls = $('<div id="game-controls"></div>');
    uiContainers.difficultyContainer = $('<div id="difficulty-container"></div>');
    uiContainers.infoContainer = $('<div id="info-container"></div>');
    uiContainers.gameBoard = $('<div id="game-board"></div>');
    
    //Interactive UI Components
    uiComponents.difficultySelector = $('<select name="difficulty" id="difficulty-select"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>');
    uiComponents.difficultySelector.val(difficulty);
    uiComponents.flagCount = $('<i class="fas fa-flag"><span id="flag-count">##</span></i>');
    uiComponents.timer = $('<i class="fas fa-stopwatch"><span id="timer">##:##</span></i>');
        
    //CSS classes
    let widthClass = `${difficulty}-width`,
        widthHalfCLass = `${difficulty}-width-half`;

    //Add css classes to DOM elements
    uiContainers.gameControls.addClass(widthClass);
    uiContainers.difficultyContainer.addClass(widthHalfCLass);
    uiContainers.infoContainer.addClass(widthHalfCLass);
    uiContainers.gameBoard.addClass(widthClass);

    //Add UI containers and components to DOM
    $('main').append(uiContainers.gameControls);
    $('main').append(uiContainers.gameBoard);
    uiContainers.gameControls.append(uiContainers.difficultyContainer);
    uiContainers.gameControls.append(uiContainers.infoContainer);
    uiContainers.difficultyContainer.append(uiComponents.difficultySelector);
    uiContainers.infoContainer.append(uiComponents.flagCount);
    uiContainers.infoContainer.append(uiComponents.timer);

    
}


function resetGameLogic() {
    gameBoardLogicRep.splice(0, gameBoardLogicRep.length);
}


function initGameLogic(rows, cols) {
    for (let i = 0; i < rows; i++) {
        gameBoardLogicRep[i] = new Array(cols);
        for (let j = 0; j < cols; j++) {
            gameBoardLogicRep[i][j] = {
                domLink: null,
                isRevealed: false,
                isFlagged: false,
                isBomb: false,
                adjacentBombs: 0
            }
        }
    }
}


function initGameBoardDOM(rows, cols, difficulty) {
    
    let difficultyClass = `${difficulty}-square`

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let boardSquare = $('<div></div>');
            boardSquare.addClass(difficultyClass);
            if(i % 2 == 0) {
                if (j % 2 == 0) {
                    boardSquare.addClass('board-square');
                } else {
                    boardSquare.addClass('board-square-alt');
                }
            } else {
                if (j % 2 != 0) {
                    boardSquare.addClass('board-square');
                } else {
                    boardSquare.addClass('board-square-alt');
                }
            }
            uiContainers.gameBoard.append(boardSquare);
        }
    }
}


function reloadGameAndUi(difficulty) {
    resetGameUi();
    resetGameLogic();
    
    switch (difficulty) {
        case 'easy':
            initGameUi('easy');
            initGameBoardDOM(boardDimensions.easy.rows, boardDimensions.easy.cols, 'easy');
            initGameLogic(boardDimensions.easy.rows, boardDimensions.easy.cols);
            
            break;
        case 'medium':
            initGameUi('medium');
            initGameBoardDOM(boardDimensions.medium.rows, boardDimensions.medium.cols, 'medium');
            initGameLogic(boardDimensions.medium.rows, boardDimensions.medium.cols)
            break;
        case 'hard':
            initGameUi('hard');
            initGameBoardDOM(boardDimensions.hard.rows, boardDimensions.hard.cols, 'hard');
            initGameLogic(boardDimensions.hard.rows, boardDimensions.hard.cols)
            break;
    }

    difficultySelectorConfig();
}


function placeMines(difficulty) {
    for (let i = 0; i < boardDimensions.difficulty.mines; i++) {
        let newNum = Math.floor(Math.random * boardDimensions.difficulty.grid)
        if (!GAME_STATE.mineCoordinateSet.has(newNum)) {
            GAME_STATE.mineCoordinateSet.add(newNum);
            let row = Math.floor(newNum/boardDimensions.difficulty.cols);
            let col = newNum%boardDimensions.difficulty.cols;
            gameBoardLogicRep[row][col].isBomb = true;
        } else {
            i = i-1;
        }
    }
}


function difficultySelectorConfig() {
    uiComponents.difficultySelector.change(function() {
        reloadGameAndUi(this.value);
    })
}

function gameBoardConfig() {
    //link DOM objects to logcical storage
    //Add click listener
    //add context menu listener
}


initGameUi('easy');
initGameBoardDOM(8, 10, 'easy');
difficultySelectorConfig();



