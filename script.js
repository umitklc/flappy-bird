// Karakter seçimi ve oyun başlatma
let selectedCharacter = null;
let playerName = "";

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