const fs = require('fs');
const path = require('path');

// File untuk menyimpan daftar owner
const OWNERS_FILE = path.join(__dirname, '../../data/owners.json');

// Load owners from file
function loadOwners() {
  try {
    if (fs.existsSync(OWNERS_FILE)) {
      const data = fs.readFileSync(OWNERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[AddOwner] Failed to load owners:', e.message);
  }
  return [];
}

// Save owners to file
function saveOwners(owners) {
  try {
    fs.writeFileSync(OWNERS_FILE, JSON.stringify(owners, null, 2));
    return true;
  } catch (e) {
    console.error('[AddOwner] Failed to save owners:', e.message);
    return false;
  }
}

// Check if number is owner
function isOwner(number) {
  const owners = loadOwners();
  const clean = number.replace(/\D/g, '');
  return owners.some(o => o.replace(/\D/g, '') === clean);
}

module.exports = {
  name: 'addowner',
  aliases: ['add', 'ao'],
  category: 'owner',
  description: 'Tambah nomor owner baru',
  permission: 'owner',
  
  async execute(ctx) {
    const { from, sock, args, sender } = ctx;
    
    // Extract sender number
    const senderNumber = sender.split('@')[0].replace(/\D/g, '');
    
    // Cek apakah pengirim adalah owner yang sudah terdaftar
    const owners = loadOwners();
    const isExistingOwner = owners.some(o => o.replace(/\D/g, '') === senderNumber);
    
    // Jika belum ada owner sama sekali, yang pertama jadi owner otomatis
    if (owners.length === 0) {
      // Tambahkan pengirim sebagai owner pertama
      saveOwners([senderNumber]);
      await sock.sendMessage(from, { 
        text: `✅ ${senderNumber} ditambahkan sebagai owner pertama!` 
      });
      return;
    }
    
    // Jika bukan owner, tolak
    if (!isExistingOwner) {
      await sock.sendMessage(from, { 
        text: '❌ Anda bukan owner. Tidak bisa menambah owner baru.' 
      });
      return;
    }
    
    // Cek argumen
    if (args.length === 0) {
      await sock.sendMessage(from, { 
        text: `📋 *Daftar Owner:*\n${owners.map((o, i) => `${i+1}. ${o}`).join('\n')}\n\n📌 *Cara tambah:*\n.addowner 628xxxxxxxxxx` 
      });
      return;
    }
    
    // Ambil nomor dari argumen
    let newNumber = args[0].replace(/\D/g, '');
    
    // Validasi nomor
    if (newNumber.length < 10) {
      await sock.sendMessage(from, { 
        text: '❌ Nomor tidak valid. Minimal 10 digit.' 
      });
      return;
    }
    
    // Cek apakah sudah terdaftar
    if (owners.some(o => o.replace(/\D/g, '') === newNumber)) {
      await sock.sendMessage(from, { 
        text: `❌ Nomor ${newNumber} sudah terdaftar sebagai owner.` 
      });
      return;
    }
    
    // Tambahkan owner baru
    owners.push(newNumber);
    saveOwners(owners);
    
    await sock.sendMessage(from, { 
      text: `✅ ${newNumber} berhasil ditambahkan sebagai owner!\n\n📋 *Daftar Owner:*\n${owners.map((o, i) => `${i+1}. ${o}`).join('\n')}` 
    });
    
    // Log
    console.log(`[AddOwner] ${senderNumber} added ${newNumber} as owner`);
  }
};
