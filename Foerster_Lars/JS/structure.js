const field = new Array(10);
for (let i = 0; i < 10; i++) {
    field[i] = new Array(10);
}

let steps = 0;
let timerInterval;


function showPlayername() {
    let text = document.getElementById("nameInput").value;
    document.getElementById("showName").textContent = "Hero: " + text;
}

const startTimer = () => {
    let minutes = 0;
    let seconds = 0;

    const display = document.getElementById("timer");

    timerInterval = setInterval(() => {
        seconds++;

        if (seconds >= 60) {
            minutes++;
            seconds = 0;
        }
        display.textContent = `Timer: ${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }, 1000);
};

let obstacle1Count;
let obstacle2Count;

function createMap() {

    const nameInput = document.getElementById("nameInput");
    const playButton = document.getElementById("playButton");


    if (!nameInput.value) {
        alert("please enter your name!");
        return;
    }

    obstacle1Count = parseInt(document.getElementById("obstacle1Count").value);
    obstacle2Count = parseInt(document.getElementById("obstacle2Count").value);


    playButton.removeEventListener("click", createMap);

    document.getElementById("welcome").remove();

    document.querySelector("#game .foot").classList.remove("hidden");

    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            let cell = document.createElement("div");
            cell.setAttribute("class", "cell");
            field[y][x] = cell;

            document.getElementById("mapContainer").appendChild(cell);
        }
    }
    startTimer();
    changeImages(obstacle1Count, obstacle2Count);
    generateMap();
    placeCharacters();
}

function changeImages(obstacle1Count = 12, obstacle2Count = 12) {
    const cells = document.getElementsByClassName("cell");
    const images = [
        { path: "../Images/ground1.png", type: "ground" },
        { path: "../Images/ground2.png", type: "ground" },
        { path: "../Images/ground3.png", type: "ground" },
        { path: "../Images/obstacle1.png", type: "obstacle" },
        { path: "../Images/obstacle2.png", type: "obstacle" },
    ];

    const obstacle1Images = images.filter((image) => image.type === "obstacle" && image.path.includes("obstacle1"));
    const obstacle2Images = images.filter((image) => image.type === "obstacle" && image.path.includes("obstacle2"));

    const obstacle1Indexes = getRandomIndexes(cells.length, obstacle1Count);
    const obstacle2Indexes = getRandomIndexes(cells.length, obstacle2Count);

    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];

        if (obstacle1Indexes.includes(i)) {
            const randomImage = getRandomImageFromArray(obstacle1Images);
            cell.style.backgroundImage = "url('" + randomImage.path + "')";
            cell.classList.add("obstacle");
        } else if (obstacle2Indexes.includes(i)) {
            const randomImage = getRandomImageFromArray(obstacle2Images);
            cell.style.backgroundImage = "url('" + randomImage.path + "')";
            cell.classList.add("obstacle");
        } else {
            const randomImage = getRandomImageFromArray(images.filter((image) => image.type === "ground"));
            cell.style.backgroundImage = "url('" + randomImage.path + "')";

            if (cell.classList.contains("obstacle")) {
                cell.classList.remove("obstacle");
            }
        }
    }
}

function getRandomIndexes(max, count) {
    const indexes = [];

    while (indexes.length < count) {
        const randomIndex = Math.floor(Math.random() * max);

        if (!indexes.includes(randomIndex)) {
            indexes.push(randomIndex);
        }
    }

    return indexes;
}

function getRandomImageFromArray(images) {
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
}


let heroPosition = null;

function placeCharacters() {
    const cells = document.getElementsByClassName("cell");
    const characterClasses = [
        { class: "hero", image: "../Images/Hero.png" },
        { class: "princess", image: "../Images/Princess.png" },
        { class: "enemy", image: "../Images/Enemy.png" },
    ];

    const obstacleCells = document.getElementsByClassName("obstacle");
    const obstacleIndexes = Array.from(obstacleCells).map((cell) =>
        Array.prototype.indexOf.call(cells, cell),
    );

    const occupiedIndexes = []; // Array to store the already occupied indexes

    // Removing the old characters
    const oldCharacters = document.getElementsByClassName("character");
    while (oldCharacters.length > 0) {
        oldCharacters[0].parentNode.removeChild(oldCharacters[0]);
    }

    for (let i = 0; i < characterClasses.length; i++) {
        let randomIndex = getRandomIndex(cells.length, occupiedIndexes);
        const { class: characterClass, image } = characterClasses[i];

        // Checking if the randomly selected cell is an obstacle, already occupied, or too close to other characters
        while (
            obstacleIndexes.includes(randomIndex) ||
            occupiedIndexes.includes(randomIndex) ||
            isTooClose(cells, randomIndex, occupiedIndexes)
            ) {
            randomIndex = getRandomIndex(cells.length, occupiedIndexes);
        }

        if (characterClass === "hero") {
            heroPosition = randomIndex; // Storing the position of the hero
        }

        occupiedIndexes.push(randomIndex); // Adding the occupied index to the array

        const characterElement = document.createElement("div");
        characterElement.classList.add("character");
        characterElement.classList.add(characterClass);
        characterElement.style.backgroundImage = "url('" + image + "')";
        cells[randomIndex].appendChild(characterElement);
    }

    addClickEvent(cells); // Adding the click event after placing the characters
}

function isTooClose(cells, newIndex, occupiedIndexes) {
    const gridSize = Math.sqrt(cells.length);

    for (let i = 0; i < occupiedIndexes.length; i++) {
        const occupiedIndex = occupiedIndexes[i];

        const rowOccupied = Math.floor(occupiedIndex / gridSize);
        const colOccupied = occupiedIndex % gridSize;

        const rowNew = Math.floor(newIndex / gridSize);
        const colNew = newIndex % gridSize;

        const distance = Math.sqrt(
            Math.pow(rowOccupied - rowNew, 2) + Math.pow(colOccupied - colNew, 2),
        );

        if (distance < 3) {
            return true;
        }
    }

    return false;
}

function addClickEvent(cells) {
    for (let i = 0; i < cells.length; i++) {
        cells[i].addEventListener("click", function () {
            moveHero(i);
        });
    }
}

function moveHero(newIndex) {
    const cells = document.getElementsByClassName("cell");
    const heroCell = cells[heroPosition];
    const newCell = cells[newIndex];

    // Checking if the new field is adjacent (diagonal, vertical, or horizontal) and not an obstacle
    if (isAdjacentCell(heroPosition, newIndex) &&
        !newCell.classList.contains("obstacle")) {

        // Removing the existing hero
        const heroElement = heroCell.querySelector(".hero");
        heroCell.removeChild(heroElement);

        // Generating the new hero in the selected cell
        const newHeroElement = document.createElement("div");
        newHeroElement.classList.add("character");
        newHeroElement.classList.add("hero");
        newHeroElement.style.backgroundImage = "url('../Images/Hero.png')";
        newCell.appendChild(newHeroElement);

        // Updating the hero position
        heroPosition = newIndex;

        // Increasing steps by 1
        steps++;
        document.getElementById("steps").textContent = "Steps: " + steps;

        // Checking if debug mode is enabled and updating the debug cells
        if (debugMode) {
            updateDebugCells();
        }

        moveCharacters();
    }
}

function moveCharacters() {
    moveHero();
    setTimeout(movePrincess, 400);
    setTimeout(moveEnemy, 800);
    checkCollisions();
}

function updateDebugCells() {
    const cells = document.getElementsByClassName("cell");
    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        cell.classList.remove("allowed");
        if (
            isAdjacentCell(heroPosition, i) &&
            !cell.classList.contains("obstacle")
        ) {
            cell.classList.add("allowed");
        }
    }
}

function isAdjacentCell(positionA, positionB) {
    const cells = document.getElementsByClassName("cell");
    const gridSize = Math.sqrt(cells.length);

    const rowA = Math.floor(positionA / gridSize);
    const colA = positionA % gridSize;

    const rowB = Math.floor(positionB / gridSize);
    const colB = positionB % gridSize;

    // Checking if the two cells are adjacent (diagonal, vertical, or horizontal)
    return (
        Math.abs(rowA - rowB) <= 1 &&
        Math.abs(colA - colB) <= 1 &&
        !(rowA === rowB && colA === colB)
    );
}

function getRandomIndex(max, occupiedIndexes) {
    let randomIndex = Math.floor(Math.random() * max);
    // Checking if the generated index is already occupied
    while (occupiedIndexes.includes(randomIndex)) {
        randomIndex = Math.floor(Math.random() * max);
    }
    return randomIndex;
}
let debugMode = false;

// Adding the event listener function to toggle debug mode
document
    .getElementById("debugButton")
    .addEventListener("click", toggleDebugMode);

// Updated toggleDebugMode() function
function toggleDebugMode() {
    debugMode = !debugMode; // Reversing the current debug mode status
    const cells = document.getElementsByClassName("cell");

    if (debugMode) {
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            cell.classList.add("debug-cell");

            if (
                isAdjacentCell(heroPosition, i) &&
                !cell.classList.contains("obstacle")
            ) {
                cell.classList.add("allowed");
            }
        }
    } else {
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            cell.classList.remove("debug-cell");
            cell.classList.remove("allowed");
        }
    }
}

function moveEnemy() {
    const cells = document.getElementsByClassName("cell");
    const enemyCell = document.querySelector(".enemy");
    const princessCell = document.querySelector(".princess");

    // Determining the current position of the enemy and the princess
    const enemyPosition = Array.prototype.indexOf.call(
        cells,
        enemyCell.parentNode,
    );
    const princessPosition = Array.prototype.indexOf.call(
        cells,
        princessCell.parentNode,
    );

    // Determining the coordinates (row and column) of the current positions
    const gridSize = Math.sqrt(cells.length);
    const enemyRow = Math.floor(enemyPosition / gridSize);
    const enemyCol = enemyPosition % gridSize;
    const princessRow = Math.floor(princessPosition / gridSize);
    const princessCol = princessPosition % gridSize;

    // Determining the next target for the enemy based on the position of the princess
    let nextRow = enemyRow;
    let nextCol = enemyCol;

    if (enemyRow < princessRow) {
        nextRow = enemyRow + 1;
    } else if (enemyRow > princessRow) {
        nextRow = enemyRow - 1;
    }

    if (enemyCol < princessCol) {
        nextCol = enemyCol + 1;
    } else if (enemyCol > princessCol) {
        nextCol = enemyCol - 1;
    }

    // Checking if the direct next cell is a valid cell and not an obstacle
    const directNextIndex = nextRow * gridSize + nextCol;

    if (
        directNextIndex >= 0 &&
        directNextIndex < cells.length &&
        !cells[directNextIndex].classList.contains("obstacle") &&
        !cells[directNextIndex].classList.contains("obstacle-enemy")
    ) {
        // Removing the enemy from the current cell
        enemyCell.parentNode.removeChild(enemyCell);

        // Marking the previous cell as an obstacle for the enemy
        const previousIndex = enemyRow * gridSize + enemyCol;
        cells[previousIndex].classList.add("obstacle-enemy");

        // Generating the enemy in the new target cell
        generateEnemyInNewCell(cells, directNextIndex);
    } else {
        // Obstacle detected or target cell unreachable, look for alternative paths
        const possibleMoves = [
            { row: enemyRow - 1, col: enemyCol }, // up
            { row: enemyRow + 1, col: enemyCol }, // down
            { row: enemyRow, col: enemyCol - 1 }, // left
            { row: enemyRow, col: enemyCol + 1 }, // right
            { row: enemyRow - 1, col: enemyCol - 1 }, // top left
            { row: enemyRow - 1, col: enemyCol + 1 }, // top right
            { row: enemyRow + 1, col: enemyCol - 1 }, // bottom left
            { row: enemyRow + 1, col: enemyCol + 1 }, // bottom right
        ];

        // Filtering the valid moves without obstacles
        const validMoves = possibleMoves.filter((move) => {
            const moveIndex = move.row * gridSize + move.col;
            return (
                move.row >= 0 &&
                move.row < gridSize &&
                move.col >= 0 &&
                move.col < gridSize &&
                !cells[moveIndex].classList.contains("obstacle") &&
                !cells[moveIndex].classList.contains("obstacle-enemy")
            );
        });

        // Selecting a random valid move
        if (validMoves.length > 0) {
            const randomMove =
                validMoves[Math.floor(Math.random() * validMoves.length)];
            nextRow = randomMove.row;
            nextCol = randomMove.col;

            const nextIndex = nextRow * gridSize + nextCol;

            // Removing the enemy from the current cell
            enemyCell.parentNode.removeChild(enemyCell);

            // Marking the previous cell as an obstacle for the enemy
            const previousIndex = enemyRow * gridSize + enemyCol;
            cells[previousIndex].classList.add("obstacle-enemy");

            // Generating the enemy in the new target cell
            generateEnemyInNewCell(cells, nextIndex);

            checkCollisions();
        }
    }
}

function generateEnemyInNewCell(cells, nextIndex) {
    // Generating the enemy in the new target cell
    const newEnemyElement = document.createElement("div");
    newEnemyElement.classList.add("character");
    newEnemyElement.classList.add("enemy");
    newEnemyElement.style.backgroundImage = "url('../Images/Enemy.png')";
    cells[nextIndex].appendChild(newEnemyElement);
}

function movePrincess() {
    const cells = document.getElementsByClassName("cell");
    const princessCell = document.querySelector(".princess");
    document.querySelector(".enemy");

    // Determining the current position of the princess
    const princessPosition = Array.prototype.indexOf.call(
        cells,
        princessCell.parentNode,
    );

    // Determining the coordinates (row and column) of the current position of the princess
    const gridSize = Math.sqrt(cells.length);
    const princessRow = Math.floor(princessPosition / gridSize);
    const princessCol = princessPosition % gridSize;

    // Determining the possible movement directions for the princess to move away from the enemy
    const possibleMoves = [];

    // Adding all possible moves
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
            if (rowOffset !== 0 || colOffset !== 0) {
                possibleMoves.push({
                    row: princessRow + rowOffset,
                    col: princessCol + colOffset,
                });
            }
        }
    }

    // Filtering the valid moves within the game field
    const validMoves = possibleMoves.filter((move) => {
        const nextIndex = move.row * gridSize + move.col;
        return (
            move.row >= 0 &&
            move.row < gridSize &&
            move.col >= 0 &&
            move.col < gridSize &&
            !cells[nextIndex].classList.contains("obstacle")
        );
    });

    // Selecting a random valid move
    if (validMoves.length > 0) {
        const randomMove =
            validMoves[Math.floor(Math.random() * validMoves.length)];
        const nextIndex = randomMove.row * gridSize + randomMove.col;

        // Removing the princess from the current cell
        princessCell.parentNode.removeChild(princessCell);

        // Generating the princess in the new target cell
        const newPrincessElement = document.createElement("div");
        newPrincessElement.classList.add("character");
        newPrincessElement.classList.add("princess");
        newPrincessElement.style.backgroundImage = "url('../Images/Princess.png')";
        cells[nextIndex].appendChild(newPrincessElement);
    }
}

function checkCollisions() {
    const cells = document.getElementsByClassName("cell");
    const heroCell = cells[heroPosition];
    const enemyCell = document.querySelector(".enemy");
    const princessCell = document.querySelector(".princess");

    const heroIndex = Array.prototype.indexOf.call(cells, heroCell);
    const enemyIndex = Array.prototype.indexOf.call(cells, enemyCell.parentNode);
    const princessIndex = Array.prototype.indexOf.call(cells, princessCell.parentNode);

    if (heroIndex === enemyIndex) {
        // Collision between Hero and Enemy
        clearInterval(timerInterval); // Stop the timer
        steps = 0; // Reset steps

        const afterGameDiv = document.getElementById("afterGame");
        const win2Screen = document.getElementById("win2Screen");
        afterGameDiv.classList.remove("hidden");
        win2Screen.classList.remove("hidden");
    }

    if (heroIndex === princessIndex) {
        // Collision between Hero and Princess
        clearInterval(timerInterval); // Stop the timer
        steps = 0; // Reset steps

        const afterGameDiv = document.getElementById("afterGame");
        const win1Screen = document.getElementById("win1Screen");
        afterGameDiv.classList.remove("hidden");
        win1Screen.classList.remove("hidden");
    }

    if (enemyIndex === princessIndex) {
        // Collision between Enemy and Princess
        clearInterval(timerInterval); // Stop the timer
        steps = 0; // Reset steps

        const afterGameDiv = document.getElementById("afterGame");
        const loseScreen = document.getElementById("loseScreen");
        afterGameDiv.classList.remove("hidden");
        loseScreen.classList.remove("hidden");
    }
}

function generateMap() {
    const cells = document.getElementsByClassName("cell");

    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        cell.classList.remove("obstacle");
        cell.style.backgroundImage = "";
    }

    changeImages(obstacle1Count, obstacle2Count);
}

function playAgain() {
    const afterGameDiv = document.getElementById("afterGame");
    const screens = document.getElementsByClassName("screen");

    // Resetting the timer and steps values
    clearInterval(timerInterval);
    steps = 0;

    // Removing the screens
    afterGameDiv.classList.add("hidden");
    for (let i = 0; i < screens.length; i++) {
        screens[i].classList.add("hidden");
    }

    // Regenerating the map and characters
    generateMap();
    placeCharacters();

    // Resetting the timer and steps
    startTimer();
    document.getElementById("steps").textContent = "Steps: 0";
}