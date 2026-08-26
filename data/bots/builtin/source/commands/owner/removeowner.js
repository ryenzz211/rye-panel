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
    console.error('[RemoveOwner] Failed to load owners:', e.message);
  }
  return [];
}

function saveOwners(owners) {
  try {
    fs.writeFileSync(OWNERS_FILE, JSON.stringify(owners, null, 2));
    return true;
  } catch (e) {
    console.error('[RemoveOwner] Failed to save owners:', e.message);
    return false;
  }
}

function isOwner(number) {
  const owners = loadOwners();
  const clean = number.replace(/\D/g, '');
  return owners.some(o => o.replace(/\D/g, '') === clean);
}

module.exports = {
  name: 'removeowner',
  aliases: ['delowner', 'ro'],
  category: 'owner',
  description: 'Hapus nomor owner',
  permission: 'owner',
  
  async execute(ctx) {
    const { from, sock, args, sender } = ctx;
    
    const senderNumber = sender.split('@')[0].replace(/\D/g, '');
    const owners = loadOwners();
    
    // Cek apakah pengirim owner
    if (!isOwner(senderNumber)) {
      await sock.sendMessage(from, { 
        text: '❌ Anda bukan owner. Tidak bisa menghapus owner.' 
      });
      return;
    }
    
    if (args.length === 0) {
      await sock.sendMessage(from, { 
        text: `📋 *Daftar Owner:*\n${owners.map((o, i) => `${i+1}. ${o}`).join('\n')}\n\n📌 *Cara hapus:*\n.removeowner 628xxxxxxxxxx` 
      });
      return;
    }
    
    let numberToRemove = args[0].replace(/\D/g, '');
    
    // Cek apakah ada di daftar
    const index = owners.findIndex(o => o.replace(/\D/g, '') === numberToRemove);
    
    if (index === -1) {
      await sock.sendMessage(from, { 
        text: `❌ Nomor ${numberToRemove} tidak terdaftar sebagai owner.` 
      });
      return;
    }
    
    // Cegah menghapus diri sendiri jika hanya 1 owner
    if (owners.length === 1 && owners[0].replace(/\D/g, '') === senderNumber) {
      await sock.sendMessage(from, { 
        text: '❌ Tidak bisa menghapus satu-satunya owner.' 
      });
      return;
    }
    
    // Hapus owner
    owners.splice(index, 1);
    saveOwners(owners);
    
    await sock.sendMessage(from, { 
      text: `✅ ${numberToRemove} berhasil dihapus dari daftar owner!\n\n📋 *Daftar Owner:*\n${owners.map((o, i) => `${i+1}. ${o}`).join('\n') || '(kosong)'}` 
    });
    
    console.log(`[RemoveOwner] ${senderNumber} removed ${numberToRemove} from owners`);
  }
};
