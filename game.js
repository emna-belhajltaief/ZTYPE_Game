const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let words = [];
let bullets = [];
let score = 0;
let level = 1;
let lives = 3;
let gameRunning = true;
let time = 0
let spawnWordInterval = 3000
let wordSpawnIntervalID;

const missileImg = document.getElementById("missileImg");
let missile = {
    x: canvas.width,
    y: canvas.height + 390,
    width: 40,
    height: 60,
    speed: 6,
    direction: 1 
};

let currentWord = ""; 
let currentWordIndex = -1; // Index of the word the player is trying to type

//game loop
function startGame() {
    spawnWord();
    wordSpawnIntervalID = setInterval(spawnWord, spawnWordInterval); 
    setInterval(shootBullet, 1000); 
    gameLoop();
    updateScore();
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

function updateLevel() {
    let previousLevel = level;

    if (score >= 0 && score < 50) {
        level = 1;
        spawnWordInterval = 3000;
    } else if (score >= 50 && score < 100) {
        level = 2;
        spawnWordInterval = 2000;
    } else if (score >= 100 && score < 150) {
        level = 3;
        spawnWordInterval = 1000;
    } else if (score >= 130) {
        level = 4;
        spawnWordInterval = 500;
    }

    // If the level changes, wait until all words are gone before proceeding
    if (level !== previousLevel) {
        clearInterval(wordSpawnIntervalID); 

        // Wait until all words are removed from the screen
        const waitForWordsToDisappear = setInterval(() => {
            if (words.length === 0) {
                clearInterval(waitForWordsToDisappear); 

                showLevelTransition(level); 

                setTimeout(() => {
                    
                    wordSpawnIntervalID = setInterval(spawnWord, spawnWordInterval);
                }, 3000); 
            }
        }, 100); 
    }

    document.getElementById("level").textContent = level;
}


function showLevelTransition(level) {
    const levelDisplay = document.getElementById("levelDisplay");


    levelDisplay.textContent = `Level ${level}`;
    levelDisplay.classList.add("fade-in");

    setTimeout(() => {
        levelDisplay.classList.remove("fade-in");
        levelDisplay.classList.add("fade-out");

        setTimeout(() => {
            levelDisplay.classList.remove("fade-out");
        }, 2000);
    }, 2000);
}




function getRandomWord() {
    const wordList = ["CPU", "Development", "ISIMM", "Club", "Web", "Html", "Css", "ZType", "Algorithm", "Github", "API",
        "Game", "Formation", "Javascript", "Computer", "React", "Angular", "PHP", "FrontEnd", "BackEnd", "CodeForces",
        "CyberBot", "Fighter", "Autonome", "Junior", "ToutTerrain", "Design", "Media", "LeetCode", "Cloud", "AI", "ComputerVision",
        "Display", "Flex", "Grid", "Row", "Column", "Align", "CompetitiveProgramming", "ProblemSolving", "Python", "Codeforces", "Linkedin", "Robot", 
        "Arduino"
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
        ctx.fillRect(bullet.x, bullet.y, 10, 8);
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
    ctx.font = "18px PressStart2P";
    ctx.fillStyle = "#fff";
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
    updateLevel();
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
    document.getElementById("scoreBoard").style.display='none';
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
    updateScore();
    requestAnimationFrame(gameLoop);
    // time += 1
    // if (time%500 == 0 && spawnWordInterval > 1000) {
    //     spawnWordInterval -= 200
    // }
    // console.log(time)
    // console.log(spawnWordInterval)
}


function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


function restartGame() {
    clearInterval(wordSpawnIntervalID);
    document.getElementById("gameOver").classList.remove("visible");
    words = [];
    bullets = [];
    score = 0;
    lives = 3;
    level = 1;
    spawnWordInterval = 3000
    gameRunning = true;
    updateScore();
    updateLives();
    startGame();
    document.getElementById("scoreBoard").style.display='flex';
}


canvas.width = 1000;
canvas.height = 650;

window.onload = function () {
    document.getElementById("highestScore").innerText = highestScore;
    startGame();
};
