const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'frontend/views/bots/index.ejs');
let content = fs.readFileSync(filePath, 'utf8');

// Cari dan hapus duplikasi session modal yang error
const wrongPattern = /\/\/ ============ SESSION MODAL ============[\s\S]*?\/\/ Auto refresh every 5 seconds/;
const correctScript = `  // ============ SESSION MODAL ============
  let sessionBotId = null;
  let countdownInterval = null;

  function openSessionModal(botId, botName) {
    sessionBotId = botId;
    document.getElementById('sessionModalBot').textContent = 'Bot: ' + botName;
    document.getElementById('sessionModal').classList.add('active');
    
    let count = 5;
    document.getElementById('countdownNumber').textContent = count;
    document.getElementById('confirmDeleteBtn').disabled = true;
    
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(countdownInterval);
        document.getElementById('countdownNumber').textContent = '0';
        document.getElementById('confirmDeleteBtn').disabled = false;
      } else {
        document.getElementById('countdownNumber').textContent = count;
      }
    }, 1000);
  }

  function closeSessionModal() {
    document.getElementById('sessionModal').classList.remove('active');
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    document.getElementById('confirmDeleteBtn').disabled = true;
  }

  async function confirmDeleteSession() {
    if (!sessionBotId) return;
    
    try {
      const res = await fetch(\`/api/sessions/\${sessionBotId}\`, {
        method: 'DELETE'
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('✅ Session berhasil dihapus!');
        closeSessionModal();
        loadBots();
      } else {
        alert('❌ Gagal hapus session: ' + data.message);
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  }

  // Click outside to close modals
  document.getElementById('terminalModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('terminalModal')) {
      closeTerminal();
    }
  });

  document.getElementById('sessionModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('sessionModal')) {
      closeSessionModal();
    }
  });

  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (document.getElementById('terminalModal').classList.contains('active')) {
        closeTerminal();
      }
      if (document.getElementById('sessionModal').classList.contains('active')) {
        closeSessionModal();
      }
    }
  });

  // Auto refresh every 5 seconds
  loadBots();
  setInterval(loadBots, 5000);`;

// Replace wrong content
content = content.replace(wrongPattern, correctScript);

fs.writeFileSync(filePath, content);
console.log('✅ Session modal fixed!');
