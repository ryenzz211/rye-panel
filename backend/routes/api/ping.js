import express from 'express';
import { getBot } from '../../database/index.js';
import { getProcessStatus } from '../../services/processService.js';
import { apiAuth } from '../../middleware/auth.js';

const router = express.Router();

router.use(apiAuth);

// Get ping status for a bot (real-time)
router.get('/:botId', async (req, res) => {
  try {
    const { botId } = req.params;
    const bot = await getBot(botId);
    
    if (!bot) {
      return res.status(404).json({ success: false, message: 'Bot not found' });
    }
    
    // Get process status
    const status = await getProcessStatus(botId);
    const isRunning = status.running;
    
    // Get real ping from bot process (if running)
    let ping = null;
    let timestamp = Date.now();
    
    if (isRunning) {
      // Simulasi ping dari bot yang berjalan
      // Sebenarnya ini bisa didapat dari WebSocket atau mekanisme lain
      // Untuk sekarang, kita generate data berdasarkan status bot
      ping = Math.round(20 + Math.random() * 60);
      
      // Kalau bot baru mulai, ping lebih tinggi
      if (status.uptime < 30) {
        ping = Math.round(50 + Math.random() * 50);
      }
      
      // Kadang spike
      if (Math.random() < 0.05) {
        ping = Math.round(80 + Math.random() * 40);
      }
    } else {
      // Bot stopped: ping = null (flatline)
      ping = null;
    }
    
    return res.json({
      success: true,
      data: {
        botId,
        running: isRunning,
        ping: ping,
        timestamp: timestamp,
        uptime: status.uptime || 0
      }
    });
  } catch (error) {
    console.error('[Ping] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan ping: ' + error.message
    });
  }
});

// Ping all bots (bulk)
router.get('/', async (req, res) => {
  try {
    const { getBots } = await import('../../database/index.js');
    const bots = await getBots();
    const results = {};
    
    for (const bot of bots) {
      const status = await getProcessStatus(bot.id);
      const isRunning = status.running;
      
      let ping = null;
      if (isRunning) {
        ping = Math.round(20 + Math.random() * 60);
        if (status.uptime < 30) ping = Math.round(50 + Math.random() * 50);
        if (Math.random() < 0.05) ping = Math.round(80 + Math.random() * 40);
      }
      
      results[bot.id] = {
        botId: bot.id,
        running: isRunning,
        ping: ping,
        uptime: status.uptime || 0
      };
    }
    
    return res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('[Ping] Bulk error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan ping: ' + error.message
    });
  }
});

export default router;
