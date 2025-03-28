// Oyun değişkenleri
let bird;
let pipes = [];
let score = 0;
let level = 1;
let gameSpeed = 2;
let gapHeight = 200;
let gravity = 0.5;
let jumpForce = -10;
let isGameOver = false;
let playerName = localStorage.getItem('playerName');
let character = localStorage.getItem('character');

// Oyun başlangıcı
function initGame() {
    // Oyuncu karakterini ayarla
    bird = document.getElementById('bird');
    
    if (character === 'other') {
        bird.style.width = '40px';
        bird.style.height = '40px';
        bird.style.backgroundColor = '#e74c3c';
        bird.style.borderRadius = '50%';
    } else {
        bird.style.width = '50px';
        bird.style.height = '50px';
        bird.style.backgroundImage = `url(assets/${character}.png)`;
        bird.style.backgroundSize = 'contain';
        bird.style.backgroundRepeat = 'no-repeat';
    }
    
    // Yunus için kolay mod ayarları
    if (character === 'Yunus') {
        gapHeight = 250;
        gameSpeed = 1.5;
        jumpForce = -12;
    }
    
    // Başlangıç pozisyonu
    bird.style.left = '100px';
    bird.style.top = '300px';
    bird.velocity = 0;
    
    // Olay dinleyicileri
    document.addEventListener('keydown', handleJump);
    document.getElementById('game-container').addEventListener('click', handleJump);
    
    // Oyun döngüsünü başlat
    requestAnimationFrame(gameLoop);
    
    // Boru oluşturma döngüsü
    setInterval(createPipe, 2000);
}

// Zıplama fonksiyonu
function handleJump(e) {
    if ((e.type === 'keydown' && e.code === 'Space') || e.type === 'click') {
        if (isGameOver) {
            return;
        } else {
            bird.velocity = jumpForce;
        }
    }
}

// Boru oluşturma
function createPipe() {
    if (isGameOver) return;
    
    const gameContainer = document.getElementById('game-container');
    const containerHeight = gameContainer.offsetHeight;
    
    // Üst boru için rastgele yükseklik
    const topHeight = Math.floor(Math.random() * (containerHeight - gapHeight - 100)) + 50;
    
    // Boruları oluştur
    const topPipe = document.createElement('div');
    topPipe.className = 'pipe';
    topPipe.style.height = `${topHeight}px`;
    topPipe.style.top = '0';
    topPipe.style.left = '400px';
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

// Oyun döngüsü
function gameLoop() {
    if (!isGameOver) {
        updateBird();
        updatePipes();
        checkCollisions();
    }
    requestAnimationFrame(gameLoop);
}

// Kuşu güncelle
function updateBird() {
    bird.velocity += gravity;
    const currentTop = parseInt(bird.style.top);
    bird.style.top = `${currentTop + bird.velocity}px`;
    
    // Zemine veya tavana çarptı mı?
    if (currentTop <= 0 || currentTop >= document.getElementById('game-container').offsetHeight - 50) {
        gameOver();
    }
}

// Boruları güncelle
function updatePipes() {
    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        const currentLeft = parseInt(pipe.top.style.left);
        
        // Boruyu hareket ettir
        pipe.top.style.left = `${currentLeft - gameSpeed}px`;
        pipe.bottom.style.left = `${currentLeft - gameSpeed}px`;
        
        // Boru ekranın dışına çıktı mı?
        if (currentLeft < -60) {
            pipe.top.remove();
            pipe.bottom.remove();
            pipes.splice(i, 1);
        }
        
        // Boruyu geçti mi?
        if (!pipe.passed && currentLeft < 100) {
            pipe.passed = true;
            score++;
            document.getElementById('score-display').textContent = `Skor: ${score}`;
            
            // Seviye atlama kontrolü
            if (score % 10 === 0) {
                levelUp();
            }
        }
    }
}

// Seviye atlama
function levelUp() {
    level++;
    gameSpeed += 0.5;
    gapHeight = Math.max(100, gapHeight - 10);
    document.getElementById('level-display').textContent = `Seviye: ${level}`;
}

// Çarpışma kontrolü
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

// Oyun bitişi
function gameOver() {
    if (isGameOver) return;
    isGameOver = true;
    
    // Skoru kaydet
    saveScore(playerName, score);
    
    // Oyun bitiş ekranı
    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'game-over';
    gameOverDiv.innerHTML = `
        <h2>Oyun Bitti!</h2>
        <p>Skor: ${score}</p>
        <p>Seviye: ${level}</p>
        <div class="game-over-buttons">
            <button onclick="window.location.reload()">Tekrar Oyna</button>
            <button onclick="window.location.href='index.html'">Ana Sayfa</button>
        </div>
    `;
    document.getElementById('game-container').appendChild(gameOverDiv);
}

// Skoru kaydet
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

// Oyunu başlat
window.onload = initGame;