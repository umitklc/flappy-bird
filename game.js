let bird;
let pipes = [];
let score = 0;
let level = 1;
let gameSpeed = 2;
let gapHeight = 300;
let gravity = 0.5;
let jumpForce = -7;
let isGameOver = false;
let playerName = localStorage.getItem('playerName');
let character = localStorage.getItem('character');
let lastTime = 0;
const fps = 60;
const interval = 1000/fps;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

function initGame() {
    bird = document.getElementById('bird');
    
    if (character === 'other') {
        bird.style.width = '40px';
        bird.style.height = '40px';
        bird.style.backgroundColor = '#e74c3c';
        bird.style.borderRadius = '50%'
     
    } else {
        bird.style.width = '50px';
        bird.style.height = '50px';
        bird.style.backgroundImage = `url(assets/${character}.png)`;
        
        bird.style.backgroundRepeat = 'no-repeat';
        bird.style.borderRadius = '50%'
         
    }
    
    if (character === 'Yunus') {
        gapHeight = 250;
        gameSpeed = 1.5;
        jumpForce = -12;
    }
    
    if (isMobile) {
        gapHeight = 140;
        jumpForce = -5;
        gravity = 0.3;
    }
    
    bird.style.left = '100px';
    bird.style.top = '300px';
    bird.velocity = 0;
    
    document.addEventListener('keydown', handleJump);
    document.getElementById('game-container').addEventListener('touchstart', handleTouch, { passive: false });
    document.getElementById('game-container').addEventListener('click', handleJump);
    
    requestAnimationFrame(gameLoop);
    setInterval(createPipe, 2000);
}

function handleTouch(e) {
    e.preventDefault();
    if (isGameOver) {
        const elements = document.elementsFromPoint(e.touches[0].clientX, e.touches[0].clientY);
        for (let element of elements) {
            if (element.tagName === 'BUTTON') {
                element.click();
                break;
            }
        }
    } else {
        bird.velocity = jumpForce;
    }
}

function handleJump(e) {
    if ((e.type === 'keydown' && e.code === 'Space') || e.type === 'click') {
        if (!isGameOver) {
            bird.velocity = jumpForce;
        }
    }
}

function createPipe() {
    if (isGameOver) return;
    
    const gameContainer = document.getElementById('game-container');
    const containerHeight = gameContainer.offsetHeight;
    const topHeight = Math.floor(Math.random() * (containerHeight - gapHeight - 100)) + 50;
    
    const topPipe = document.createElement('div');
    topPipe.className = 'pipe';
    topPipe.style.height = `${topHeight}px`;
    topPipe.style.top = '0';
    topPipe.style.left = '600px';
    gameContainer.appendChild(topPipe);
    
    const bottomPipe = document.createElement('div');
    bottomPipe.className = 'pipe';
    bottomPipe.style.height = `${containerHeight - topHeight - gapHeight}px`;
    bottomPipe.style.bottom = '0';
    bottomPipe.style.left = '400px';
    gameContainer.appendChild(bottomPipe);
    
    pipes.push({
        top: topPipe,
        bottom: bottomPipe,
        passed: false
    });
}

function gameLoop(timestamp) {
    if (timestamp - lastTime > interval) {
        if (!isGameOver) {
            updateBird();
            updatePipes();
            checkCollisions();
        }
        lastTime = timestamp;
    }
    requestAnimationFrame(gameLoop);
}

function updateBird() {
    bird.velocity += gravity;
    const currentTop = parseInt(bird.style.top);
    bird.style.top = `${currentTop + bird.velocity}px`;
    
    if (currentTop <= 0 || currentTop >= document.getElementById('game-container').offsetHeight - 50) {
        gameOver();
    }
}

function updatePipes() {
    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        const currentLeft = parseInt(pipe.top.style.left);
        
        pipe.top.style.left = `${currentLeft - gameSpeed}px`;
        pipe.bottom.style.left = `${currentLeft - gameSpeed}px`;
        
        if (currentLeft < -60) {
            pipe.top.remove();
            pipe.bottom.remove();
            pipes.splice(i, 1);
        }
        
        if (!pipe.passed && currentLeft < 100) {
            pipe.passed = true;
            score++;
            document.getElementById('score-display').textContent = `Skor: ${score}`;
            
            if (score % 10 === 0) {
                levelUp();
            }
        }
    }
}

function levelUp() {
    level++;
    gameSpeed += 0.5;
    gapHeight = Math.max(100, gapHeight - 10);
    document.getElementById('level-display').textContent = `Seviye: ${level}`;
}

function checkCollisions() {
    const birdRect = bird.getBoundingClientRect();
    
    for (const pipe of pipes) {
        const topPipeRect = pipe.top.getBoundingClientRect();
        const bottomPipeRect = pipe.bottom.getBoundingClientRect();
        
        if (
            birdRect.right > topPipeRect.left &&
            birdRect.left < topPipeRect.right &&
            (birdRect.top < topPipeRect.bottom || birdRect.bottom > bottomPipeRect.top)
        ) {
            gameOver();
            break;
        }
    }
}

function gameOver() {
    if (isGameOver) return;
    isGameOver = true;
    
    saveScore(playerName, score);
    showGameOverScreen();
}

function showGameOverScreen() {
    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'game-over';
    gameOverDiv.innerHTML = `
        <h2>Oyun Bitti!</h2>
        <p>Skor: ${score}</p>
        <p>Seviye: ${level}</p>
        <div class="game-over-buttons">
            <button id="restart-btn">Tekrar Oyna</button>
            <button id="home-btn">Ana Sayfa</button>
        </div>
    `;
    document.getElementById('game-container').appendChild(gameOverDiv);
    
    document.getElementById('restart-btn').addEventListener('click', () => window.location.reload());
    document.getElementById('home-btn').addEventListener('click', () => window.location.href = 'index.html');
    
    if (isMobile) {
        document.getElementById('restart-btn').addEventListener('touchend', (e) => {
            e.preventDefault();
            window.location.reload();
        }, { passive: false });
        
        document.getElementById('home-btn').addEventListener('touchend', (e) => {
            e.preventDefault();
            window.location.href = 'index.html';
        }, { passive: false });
    }
}

function saveScore(name, score) {
    try {
        const scores = JSON.parse(localStorage.getItem('flappyScores') || '[]');
        scores.push({ name, score });
        scores.sort((a, b) => b.score - a.score);
        localStorage.setItem('flappyScores', JSON.stringify(scores));
    } catch (error) {
        console.error('Skor kaydedilirken hata oluştu:', error);
    }
}

window.onload = initGame;