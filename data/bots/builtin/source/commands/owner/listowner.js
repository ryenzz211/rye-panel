const fs = require('fs');
const path = require('path');

const OWNERS_FILE = path.join(__dirname, '../../data/owners.json');

function loadOwners() {
  try {
    if (fs.existsSync(OWNERS_FILE)) {
      const data = fs.readFileSync(OWNERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[ListOwner] Failed to load:', e.message);
  }
  return [];
}

module.exports = {
  name: 'listowner',
  aliases: ['owners', 'lo'],
  category: 'owner',
  description: 'Lihat daftar owner',
  permission: 'owner',
  
  async execute(ctx) {
    const { from, sock } = ctx;
    
    const owners = loadOwners();
    
    if (owners.length === 0) {
      await sock.sendMessage(from, { 
        text: '📋 *Daftar Owner:*\nBelum ada owner terdaftar.' 
      });
      return;
    }
    
    let text = `👑 *Daftar Owner*\n\n`;
    owners.forEach((o, i) => {
      text += `${i+1}. ${o}\n`;
    });
    text += `\n📌 Total: ${owners.length} owner`;
    
    await sock.sendMessage(from, { text });
  }
};
