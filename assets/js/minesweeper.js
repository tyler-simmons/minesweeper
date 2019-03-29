//-1 is empty
//99 is mine
const outOfBounds = new Set([-1, 10]);

var gameBoard = $('.game-board');
var gameControllerRows = new Array(10);
var coordinateSet = new Set([]);
var hiddenCells = 100;

for (let i = 0; i < gameControllerRows.length; i++) {
    gameControllerRows[i] = new Array(10);
    for (let j = 0; j < gameControllerRows[i].length; j++) {
        gameControllerRows[i][j] = {
            domElement: $('<div class="grid-square covered"></div>'),
            content: -1,
            neighbors: 0,
            revealed: false,
            flagged: false
        };
        gameControllerRows[i][j].domElement.on('click', function() {
            reveal(i,j);
        });
        gameControllerRows[i][j].domElement.contextmenu(function(){
            event.preventDefault();
            if (gameControllerRows[i][j].flagged == false) {
                gameControllerRows[i][j].domElement.html('&#9873;');
            } else {
                gameControllerRows[i][j].domElement.html('');
            }
            gameControllerRows[i][j].flagged = !gameControllerRows[i][j].flagged;
        })
        gameBoard.append(gameControllerRows[i][j].domElement);
    }

    gameBoard.append($('<div class="grid-spacer"</div>'));
}

//place mines randomly
for (let i = 0; i < 25; i++) {
    let newNum = Math.floor((Math.random() * 100));
    if (!coordinateSet.has(newNum)) {
        coordinateSet.add(newNum);
        let row = Math.floor(newNum/10);
        let col = newNum%10;
        gameControllerRows[row][col].content = 99;
    } 
}

//calculate number of mines adjacent
for (let x = 0; x < gameControllerRows.length; x++) {
    for (let y = 0; y < gameControllerRows[x].length; y++){
        if (gameControllerRows[x][y].content != 99) {
            let validNeighbors = findContiguousCells(x,y);
            let neighborCount = 0;
            validNeighbors.forEach(function(coordinate) {
            if(gameControllerRows[coordinate.x][coordinate.y].content == 99) {
                neighborCount++;
            }
            });
            gameControllerRows[x][y].neighbors = neighborCount;
        }
    }
}



//returns true if the block at x,y has a mine
function isMine(x, y) {
    let isMine = false;
    if (gameControllerRows[x][y].content == 99) { isMine = true }
    return isMine;
}



//returns array of valid, adjacent coordinates for a point
function findContiguousCells(x, y) {
    let contiguousCells = [
        {x: x - 1, y: y - 1}, {x: x - 1, y: y}, {x: x - 1, y: y + 1},
        {x: x, y: y - 1},      /*Omit Middle*/  {x: x, y: y + 1},
        {x: x + 1, y: y - 1}, {x: x + 1, y: y}, {x: x + 1, y: y + 1}
    ]
    let contigousCellsInBounds = contiguousCells.filter(coordinates => !(outOfBounds.has(coordinates.x) || outOfBounds.has(coordinates.y)));
    return contigousCellsInBounds;
}


function reveal(x, y) {
    gameControllerRows[x][y].revealed = true;
    hiddenCells--;
    if (hiddenCells == coordinateSet.size) {
        alert('You Win!!');
        return;
    }
    if (isMine(x,y)) {
        console.log('mine');
        alert('You Lose');
        showAll();
        gameControllerRows[x][y].domElement.addClass('mine');
        return;
    }
    gameControllerRows[x][y].domElement.removeClass('covered');
    gameControllerRows[x][y].domElement.addClass('uncovered');
    if (gameControllerRows[x][y].neighbors > 0){
        gameControllerRows[x][y].domElement.text(`${gameControllerRows[x][y].neighbors}`);
    }
    if (gameControllerRows[x][y].neighbors == 0) {
        fill(x,y);
    } 
}

function fill(x, y) {
    let validNeighbors = findContiguousCells(x, y);
    console.log(validNeighbors);
    let unvisitedValidNeighbors = validNeighbors.filter(coordinate => 
        gameControllerRows[coordinate.x][coordinate.y].revealed == false
    );
    console.log(unvisitedValidNeighbors);
    unvisitedValidNeighbors.forEach(function(coordinate) {
        if (gameControllerRows[coordinate.x][coordinate.y].content != 99 && gameControllerRows[coordinate.x][coordinate.y].revealed == false) {
            console.log('revealing');
            reveal(coordinate.x,coordinate.y);
        }
    });
}



function showAll() {
    for (let x = 0; x < gameControllerRows.length; x++) {
        for(let y = 0; y < gameControllerRows[x]. length; y++) {
            gameControllerRows[x][y].domElement.removeClass('covered');
            gameControllerRows[x][y].domElement.addClass('uncovered');
            if (gameControllerRows[x][y].neighbors > 0){
                gameControllerRows[x][y].domElement.text(`${gameControllerRows[x][y].neighbors}`);
            } 
            if(gameControllerRows[x][y].content == 99) {
                gameControllerRows[x][y].domElement.html('&#10040;');
            }
        }
    }
}