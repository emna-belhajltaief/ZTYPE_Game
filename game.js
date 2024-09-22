const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let words = [];
let bullets = [];
let score = 0;
let level = 1;
let lives = 3;
let gameRunning = true;

const missileImg = document.getElementById("missileImg");
let missile = {
    x: canvas.width,
    y: canvas.height + 410,
    width: 40,
    height: 60,
    speed: 2,
    direction: 1 
};

let currentWord = ""; 
let currentWordIndex = -1; // Index of the word the player is trying to type

//game loop
function startGame() {
    spawnWord();
    setInterval(spawnWord, 3000); 
    setInterval(shootBullet, 1000); 
    gameLoop();
}


function spawnWord() {
    const randomWord = getRandomWord();
    words.push({
        word: randomWord,
        x: Math.random() * (canvas.width - ctx.measureText(randomWord).width),
        y: 0,
        speed: 1 + level * 0.5 
    });
}


function getRandomWord() {
    const wordList = ["CPU", "dev", "ISIMM", "club", "web", "html", "css", "ZType", "missile",
        "game", "formation", "javascript", "bullet", "shoot", "computer", "div", "canvas", "index", "balise", "class",
        "id", "style", "font", "color", "background", "position", "top", "left", "right", "size",
        "bottom", "width", "height", "margin", "padding", "border", "box",
        "display", "flex", "grid", "row", "column", "align"
    ];
    return wordList[Math.floor(Math.random() * wordList.length)];
}


function moveMissile() {
    missile.x += missile.speed * missile.direction;

    if (missile.x + missile.width > canvas.width || missile.x < 0) {
        missile.direction *= -1;
    }
}


function drawMissile() {
    ctx.drawImage(missileImg, missile.x, missile.y, missile.width, missile.height);
}


function shootBullet() {
    bullets.push({
        x: missile.x + missile.width / 2,
        y: missile.y,
        speed: 2
    });
}


function drawBullets() {
    ctx.fillStyle = "red";
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, 5, 8);
    });
}

// Update bullet positions and handle collisions
function updateBullets() {
    bullets.forEach(bullet => {
        bullet.y -= bullet.speed;

        // Check for collision with words
        words.forEach(wordObj => {
            if (bullet.x > wordObj.x && bullet.x < wordObj.x + ctx.measureText(wordObj.word).width
                && bullet.y > wordObj.y - 20 && bullet.y < wordObj.y) {

                // Hit: remove random letter from word
                removeRandomLetter(wordObj);

                // Remove bullet after hit
                bullets = bullets.filter(b => b !== bullet);
            }
        });

        // Remove bullet if off-screen
        if (bullet.y < 0) {
            bullets = bullets.filter(b => b !== bullet);
        }
    });
}

// Remove random letter from word 
function removeRandomLetter(wordObj) {
    if (wordObj.word.length > 1) {
        const randomIndex = Math.floor(Math.random() * wordObj.word.length);
        wordObj.word = wordObj.word.slice(0, randomIndex) + wordObj.word.slice(randomIndex + 1);
    } else {
        // If the word is only one letter, it's removed
        words = words.filter(w => w !== wordObj);
        score += 10;
        updateScore();
    }
}


function drawWords() {
    ctx.font = "24px Arial";
    ctx.fillStyle = "black";
    words.forEach(wordObj => {
        ctx.fillText(wordObj.word, wordObj.x, wordObj.y);
    });
}

// Update word positions and check for collisions
function updateWords() {
    words.forEach((wordObj, index) => {
        wordObj.y += wordObj.speed;

        // Check if word reaches the bottom
        if (wordObj.y > canvas.height) {
            lives--; 
            updateLives();
            words = words.filter(w => w !== wordObj); // Remove the word
            if (lives <= 0) {
                endGame();
            }
        }
    });

    // If no word is being typed, set the first word in the array as the current word
    if (currentWordIndex === -1 && words.length > 0) {
        currentWordIndex = 0; // Set the index of the word to be typed
    }
}


document.addEventListener('keydown', function (event) {
    if (currentWordIndex !== -1 && gameRunning) {
        const wordObj = words[currentWordIndex]; // Get the current word the player is typing
        const typedLetter = event.key.toLowerCase(); // Convert to lowercase for comparison

        if (typedLetter === wordObj.word[0].toLowerCase()) {
            // Correct letter typed
            currentWord += wordObj.word[0];
            wordObj.word = wordObj.word.slice(1); // Remove the typed letter from the word

            // Check if the whole word is typed
            if (wordObj.word.length === 0) {
                words.splice(currentWordIndex, 1); // Remove the word once it's fully typed
                score += 10; // Increase score
                updateScore();

                currentWord = ""; // Reset current typed word
                currentWordIndex = -1; // Reset current word index
            }
        }
    }
});


function updateScore() {
    document.getElementById("score").innerText = score;
}


function updateLives() {
    document.getElementById("lives").innerText = lives;
}

let highestScore = localStorage.getItem('highestScore') || 0;


function endGame() {
    gameRunning = false;
     
     if (score > highestScore) {
        highestScore = score;
        localStorage.setItem('highestScore', highestScore); 
    }

    document.getElementById("finalScore").innerText = score;
    document.getElementById("highestScore").innerText = highestScore;
    document.getElementById("gameOver").classList.add("visible");
}


function gameLoop() {
    if (!gameRunning) return;
    clearCanvas();
    moveMissile();
    drawMissile(); 
    drawBullets();
    updateBullets();
    drawWords();
    updateWords();
    requestAnimationFrame(gameLoop);
}


function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


function restartGame() {
    document.getElementById("gameOver").classList.remove("visible");
    words = [];
    bullets = [];
    score = 0;
    lives = 3;
    gameRunning = true;
    updateScore();
    updateLives();
    startGame();
}


canvas.width = 1000;
canvas.height = 650;

window.onload = function () {
    document.getElementById("highestScore").innerText = highestScore;
    startGame();
};
