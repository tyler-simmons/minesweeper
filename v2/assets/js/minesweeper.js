//GAME STATE OBJECTS

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

const outOfBounds = new Set([]);

const gameMeta = {
    difficulty: 'easy',
    mines: boardDimensions.easy.mines,
    gameStarted: false,
    hiddenSquares: 0,
    firstClick : {
        x : -1,
        y: -1
    }
    
}

const flagHtml = '<i class="fas fa-flag"></i>';
const mineHtml = '<i class="fas fa-bomb"></i>'
// *************************************************************************//


// RESET FUNCTIONS

//Resets the logic representation of the game board
function resetGameLogic() {
    gameBoardLogicRep.splice(0, gameBoardLogicRep.length);
}

//Resets the uiContainers and uiComponents objects (erases the DOM elements) and clears 
//all child elements of main on the page
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


function resetGameState() {
    gameMeta.gameStarted = false;
    gameMeta.firstClick.x = -1;
    gameMeta.firstClick.y = -1;
    gameMeta.hiddenSquares = 0;
}
// *************************************************************************//

//UI HELPER FUNCTIONS

//(1)Creates the container elements for the game UI
function createUiContainers(difficulty) {
    //Create UI DOM Containers
    uiContainers.gameControls = $('<div id="game-controls"></div>');
    uiContainers.difficultyContainer = $('<div id="difficulty-container"></div>');
    uiContainers.infoContainer = $('<div id="info-container"></div>');
    uiContainers.gameBoard = $('<div id="game-board"></div>');
}

//(2)Creates the interactive components of the UI that change as the game continues or sets up
function createInteractiveComponents(difficulty) {
    //Create Interactive UI Components
    uiComponents.difficultySelector = $('<select name="difficulty" id="difficulty-select"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>');
    uiComponents.difficultySelector.val(difficulty);
    uiComponents.flagCount = $('<i class="fas fa-flag"><span id="flag-count">##</span></i>');
    uiComponents.timer = $('<i class="fas fa-stopwatch"><span id="timer">##:##</span></i>');
}

//(3)Adds the CSS classes of the corresponding difficulty to the necessary UI elements
function configureCssOnComponents(widthClass, widthHalfCLass) {
    //Add css classes to DOM elements
    uiContainers.gameControls.addClass(widthClass);
    uiContainers.difficultyContainer.addClass(widthHalfCLass);
    uiContainers.infoContainer.addClass(widthHalfCLass);
    uiContainers.gameBoard.addClass(widthClass);
}

//(4)Adds the preconfigured DOM elements to the current view
function renderDOM() {
    //Add UI containers and components to DOM
    $('main').append(uiContainers.gameControls);
    $('main').append(uiContainers.gameBoard);
    uiContainers.gameControls.append(uiContainers.difficultyContainer);
    uiContainers.gameControls.append(uiContainers.infoContainer);
    uiContainers.difficultyContainer.append(uiComponents.difficultySelector);
    uiContainers.infoContainer.append(uiComponents.flagCount);
    uiContainers.infoContainer.append(uiComponents.timer);
}


// *************************************************************************//


//INIT FUNCTIONS

//Create the game board DOM based on number of rows, columns, and difficulty params
//NEEDS gameBoardLogicRep CALLED BEFORE THIS FUNCTION CAN BE CALLED
function initGameBoardDOM(rows, cols, difficulty) {
    
    //Squares resize based on difficulty
    let difficultyClass = `${difficulty}-square`

    //Rows go from top (row 0) to bottom row(rows-1)
    for (let i = 0; i < rows; i++) {
        //For each row columns go left(0) to right(cols-1)
        for (let j = 0; j < cols; j++) {
            
            //Create board square with logic to determine the coloring of the square
            //to create the checkerboard pattern with correct hover pseudoclass
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
            
            //Add this iterations board square to the DOM
            uiContainers.gameBoard.append(boardSquare);
            
            //Link this jquery DOM object with the gameBoardLogicRep object at [i][j]
            gameBoardLogicRep[i][j].domLink = boardSquare;
        }
    }
}


//Initializes the values of the gameBoardLogicRep 2D array
//Each entry has object with jquery dom object, revealed status, flagged status, bomb status, and number of adjacent bombs
function initGameLogic(rows, cols) {
    
    //Rows go from top (row 0) to bottom row(rows-1)
    for (let i = 0; i < rows; i++) {
        //Create the second order array that represents row i's corresponding columns
        gameBoardLogicRep[i] = new Array(cols);
        
        //Iterate through all of the columns in row i and create this state object
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


//Initializes the full game UI (without the board squares)
//NEEDS gameBoardLogicRep FIRST
function initGameUi(difficulty) {
    
    //CSS classes based on difficulty parameter
    let widthClass = `${difficulty}-width`,
        widthHalfCLass = `${difficulty}-width-half`;

    //UI creation helper functions
    createUiContainers(difficulty);
    createInteractiveComponents(difficulty);
    configureCssOnComponents(widthClass, widthHalfCLass);
    
    //Render DOM
    renderDOM();
}


//Initializes the metadata for this run of the game - used by in-game logic
function initGameState(difficulty, mines, gridTotal) {
    gameMeta.difficulty = difficulty;
    gameMeta.mines = mines;
    gameMeta.hiddenSquares = gridTotal - mines;
}


// *************************************************************************//


//GAME LOGIC CONTROLLERS

//Called on the change event for the difficulty selector element 
//Resets the logical state and dom elements in memory - re-initializes the game UI and board
//Doesn't place mines - that needs to be done on the first click of the game board
function reloadGameAndUi(difficulty) {
    
    //Reset UI and Logical representation
    resetGameUi();
    resetGameLogic();
    resetGameState();
    
    //Initialize the UI and board according to difficulty
    switch (difficulty) {
        case 'easy':
            initGameState(difficulty, boardDimensions.easy.mines, boardDimensions.easy.grid);
            initGameLogic(boardDimensions.easy.rows, boardDimensions.easy.cols);
            initGameUi('easy');
            initGameBoardDOM(boardDimensions.easy.rows, boardDimensions.easy.cols, 'easy');
            gameBoardConfig();
            // initGameLogic(boardDimensions.easy.rows, boardDimensions.easy.cols);
            break;
        case 'medium':
            initGameState(difficulty, boardDimensions.medium.mines, boardDimensions.medium.grid);
            initGameLogic(boardDimensions.medium.rows, boardDimensions.medium.cols);
            initGameUi('medium');
            initGameBoardDOM(boardDimensions.medium.rows, boardDimensions.medium.cols, 'medium');
            gameBoardConfig();
            // initGameLogic(boardDimensions.medium.rows, boardDimensions.medium.cols)
            break;
        case 'hard':
            initGameState(difficulty, boardDimensions.hard.mines, boardDimensions.hard.grid);
            initGameLogic(boardDimensions.hard.rows, boardDimensions.hard.cols)
            initGameUi('hard');
            initGameBoardDOM(boardDimensions.hard.rows, boardDimensions.hard.cols, 'hard');
            gameBoardConfig();
            // initGameLogic(boardDimensions.hard.rows, boardDimensions.hard.cols)
            break;
    }

    //Re-attatch the change event listener to the difficult select element
    difficultySelectorConfig();
}


//Adds change-based event functionality to reset the game state and UI 
function difficultySelectorConfig() {
    uiComponents.difficultySelector.change(function() {
        reloadGameAndUi(this.value);
    })
}


//Randomly places the number of mines according to difficulty
//by going through the logical representation and flipping the isBomb property
//of the computed coordinates to true
function placeMines(mines, clickRow, clickCol) {
    
    //Set to make sure that there are no duplicate mine locations
    let uniqeMineLocations = new Set([]);
    let grid = gameBoardLogicRep.length * gameBoardLogicRep[0].length;
    //Mines represents total number of mines for this difficulty - place that many mines randomly
    for (let i = 0; i < mines; i++ ) {
        
        let newNum = Math.floor(Math.random() * grid);
        //Check for duplicates
        if (!uniqeMineLocations.has(newNum)) {
            let coordinates = convertToCoordinates(newNum, gameBoardLogicRep[0].length);
            //The coordinates are not the coordinates of the clicked square
            if (!(coordinates.row == clickRow && coordinates.col == clickCol)) {
                console.log(`Placing bomb @ ${coordinates.row} ${coordinates.col} from number ${newNum}`);
                gameBoardLogicRep[coordinates.row][coordinates.col].isBomb = true;
            } else {
                i = i-1;
                continue;
            }
        } else {
            i =i-1;
            continue
        }
    }
}



//Utility function for converting random number to a set of coordinates
function convertToCoordinates(index, cols) {
    let row = Math.floor(index/cols);
    let col = index%cols;
    return {
        row: row,
        col: col
    }
}



//returns an array of the coordinate pairs that are valid neighbors of x,y
function findContiguousCells(x, y) {
    //set boundaries
    let rowBoundaries = new Set([-1, gameBoardLogicRep.length]);
    let colBoundaries = new Set([-1, gameBoardLogicRep[0].length]);
    //array of possible coordinates for neighbors
    let contiguousCells = [
        {x: x - 1, y: y - 1}, {x: x - 1, y: y}, {x: x - 1, y: y + 1},
        {x: x, y: y - 1},      /*Omit Middle*/  {x: x, y: y + 1},
        {x: x + 1, y: y - 1}, {x: x + 1, y: y}, {x: x + 1, y: y + 1}
    ]
    //filter out against the invalid coordinates based on the current difficulty
    let validNeighbors = contiguousCells.filter(coordinatePair => {
        return !(rowBoundaries.has(coordinatePair.x) || colBoundaries.has(coordinatePair.y));
    })
    return validNeighbors;
}




// Iterate through logical game board (which has links to the DOM)
//And apply logical click listeners
function gameBoardConfig() {
    for (let row = 0; row < gameBoardLogicRep.length; row++) {
        for (let col = 0; col < gameBoardLogicRep[row].length; col++) {
            gameBoardLogicRep[row][col].domLink.click(function() {
                firstClickConfig(row, col);
                generalClickConfig(row, col);
                // if (event.shiftKey) {
                //     shiftClickConfig(row, col);
                // }
            });
            gameBoardLogicRep[row][col].domLink.dblclick(function() {
                shiftClickConfig(row, col);
            })
            gameBoardLogicRep[row][col].domLink.contextmenu(function() {
                
                event.preventDefault();
                if (!gameBoardLogicRep[row][col].isRevealed) {
                    if (gameBoardLogicRep[row][col].isFlagged == true) {
                        gameBoardLogicRep[row][col].domLink.empty();
                        gameBoardLogicRep[row][col].isFlagged = false;
                        gameBoardLogicRep[row][col].domLink.removeClass('flagged');
                    } else {
                        gameBoardLogicRep[row][col].domLink.html(flagHtml);
                        gameBoardLogicRep[row][col].isFlagged = true;
                        gameBoardLogicRep[row][col].domLink.addClass('flagged');
                    }
                }
            });
        }
    }
}



//Click listener configuration to handle the first click of the game - 
//makes sure that the first click isn't on a bomb
function firstClickConfig(clickRow, clickCol) {
    if (gameMeta.gameStarted == false) {
        placeMines(gameMeta.mines, clickRow, clickCol);
        gameMeta.gameStarted = true;
        gameBoardConfigPost();
    }
    console.log(`Clicked on ${clickRow} ${clickCol}, Adjacent bombs: ${gameBoardLogicRep[clickRow][clickCol].adjacentBombs}`);
}


//reveal + fill work together as the main business logic of the game
function reveal(row, col) {
    
    //reveal the square that was clicked (logical reveal NOT graphical)
    gameBoardLogicRep[row][col].isRevealed = true;
    gameMeta.hiddenSquares -= 1;
    
    //check game losing case
    if (gameBoardLogicRep[row][col].isBomb == true) {
        alert('you lose');
        return;
    }

    //check for win condition
    if (gameMeta.hiddenSquares == 0) {
        alert('You won!!');
        return;
    }

    //passed logical checks - apply graphical reveal class
    gameBoardLogicRep[row][col].domLink.addClass('revealed');

    //If the clicked square has adjacent bombs reveal JUST that square - if not,
    //call fill and recursively clear all empty neighbor squares
    if (gameBoardLogicRep[row][col].adjacentBombs > 0) {
        gameBoardLogicRep[row][col].domLink.text(`${gameBoardLogicRep[row][col].adjacentBombs}`);
        gameBoardLogicRep[row][col].domLink.addClass(`color-${gameBoardLogicRep[row][col].adjacentBombs}`);
    } else if (gameBoardLogicRep[row][col].adjacentBombs == 0) {
        fill(row, col);
    }
}

//recursive helper function - reveals all adjacent empty squares to the boundaries with numbers
//(stopped by logic check in reveal)
function fill(row, col) {
    
    //Array of valid adjacent squares
    let validNeighbors = findContiguousCells(row, col);
    
    //filter out by revealed
    let unvisitedValidNeighbors = validNeighbors.filter(coordinatePair => 
        gameBoardLogicRep[coordinatePair.x][coordinatePair.y].isRevealed == false
    );

    //recursive calls for each non-mine non-revealed square (based on flood fill)
    unvisitedValidNeighbors.forEach(function(coordinate){
        if (gameBoardLogicRep[coordinate.x][coordinate.y].isBomb == false && gameBoardLogicRep[coordinate.x][coordinate.y].isRevealed == false) {
            reveal(coordinate.x, coordinate.y);
        }
    })
}


//function that get attatched to the click event listener to handle the
//main game logic
function generalClickConfig(row, col) {
    
    //Check if the clicked on square is revealed
    reveal(row, col);
}


//Function on the shift + click event to clear all adjacent squares when
//all the adjacent mines of the target square have been flagged
function shiftClickConfig(row, col) {
    let validNeighbors = findContiguousCells(row, col);
    let flagCount = 0;
    validNeighbors.forEach((neighbor) => {
        if (gameBoardLogicRep[neighbor.x][neighbor.y].isFlagged == true) {
            flagCount += 1;
        }
    });
    if (flagCount == gameBoardLogicRep[row][col].adjacentBombs) {
        validNeighbors.forEach((neighbor) => {
            if (!gameBoardLogicRep[neighbor.x][neighbor.y].isFlagged) {
                reveal(neighbor.x, neighbor.y);
            }
        })
    }
}


//Populates the adjacent bomb indicator in the logical representation of the game
//Called after the first square is clicked once the game starts
function gameBoardConfigPost() {
    for (let row = 0; row < gameBoardLogicRep.length; row++) {
        for (let col = 0; col < gameBoardLogicRep[row].length; col++) {
            let contiguousCells = findContiguousCells(row, col);
            // console.log(contiguousCells);
            contiguousCells.forEach((coordinatePair) => {
                // console.log(coordinatePair);
                if (gameBoardLogicRep[coordinatePair.x][coordinatePair.y].isBomb == true) {
                    gameBoardLogicRep[row][col].adjacentBombs += 1;
                }
            });
        }
    }
}



initGameState('easy', 10, 80);
initGameLogic(8, 10);
initGameUi('easy');
initGameBoardDOM(8, 10, 'easy');
difficultySelectorConfig();
gameBoardConfig();



