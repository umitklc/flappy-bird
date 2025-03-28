// Karakter seçimi ve oyun başlatma
let selectedCharacter = null;
let playerName = "";
let lastTime = 0;
const fps = 60;
const interval = 1000/fps;

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile) {
    // Mobil cihazlar için özel ayarlar
    jumpForce = -12; // Daha güçlü zıplama
    gravity = 0.4; // Daha düşük yerçekimi
    gameSpeed = 1.8; // Daha yavaş başlangıç hızı
}
function selectCharacter(character) {
    selectedCharacter = character;
    playerName = character;
    startGame();
}

function selectOther() {
    document.getElementById('other-input').classList.remove('hidden');
}

function startGame() {
    if (!selectedCharacter) {
        const nameInput = document.getElementById('player-name').value.trim();
        if (nameInput === "") {
            alert("Lütfen bir isim girin!");
            return;
        }
        playerName = nameInput;
        selectedCharacter = "other";
    }
    
    // Skorları yükle
    loadScores();
    
    // Oyun sayfasına yönlendir
    localStorage.setItem('playerName', playerName);
    localStorage.setItem('character', selectedCharacter);
    window.location.href = 'game.html';
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
// Skorları yükle ve göster
function loadScores() {
    try {
        const scores = JSON.parse(localStorage.getItem('flappyScores') || '[]')
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
        
        const scoreList = document.getElementById('score-list');
        scoreList.innerHTML = '';
        
        if (scores.length === 0) {
            scoreList.innerHTML = '<div>Henüz skor kaydedilmedi</div>';
            return;
        }
        
        scores.forEach((entry, index) => {
            const scoreEntry = document.createElement('div');
            scoreEntry.textContent = `${index + 1}. ${entry.name}: ${entry.score}`;
            scoreList.appendChild(scoreEntry);
        });
    } catch (error) {
        console.error('Skorlar yüklenirken hata oluştu:', error);
        document.getElementById('score-list').innerHTML = '<div>Skorlar yüklenirken hata oluştu</div>';
    }
}

// Sayfa yüklendiğinde skorları yükle
document.addEventListener('DOMContentLoaded', loadScores);