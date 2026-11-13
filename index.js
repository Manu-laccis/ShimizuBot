// 👑 ShimizuBot - index.js
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

const BOT_NAME = 'ShimizuBot';
const OWNER_NAME = 'RyotaNaoShimizu';
const PAIRING_NUMBER = process.env.PAIRING_NUMBER;
const PREFIX = '.';
const VERSION = '1.0.0';
const MODE = 'public';

const startTime = Date.now();
function getUptime() {
  const s = Math.floor((Date.now() - startTime) / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m ${s % 60}s`;
}
function getTime() { return new Date().toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome' }); }
function getDate() { return new Date().toLocaleDateString('it-IT', { timeZone: 'Europe/Rome' }); }

function header() {
  return `*『 👑 ${BOT_NAME}』*\n*│ 👤 ᴏᴡɴᴇʀ     : ${OWNER_NAME}*\n*│ 🌍 ᴍᴏᴅᴇ      : [ ${MODE} ]*\n*│ ⏰ ᴛɪᴍᴇ      : ${getTime()}*\n*│ 📅 ᴅᴀᴛᴇ      : ${getDate()}*\n*│ 🛠️ ᴘʀᴇғɪx    : [ ${PREFIX} ]*\n*│ 🔄 ᴜᴘᴛɪᴍᴇ    : ${getUptime()}* \n*│ 🚀 ᴠᴇʀsɪᴏɴ   : ${VERSION}*\n*╰─────────⟢*\n\n`;
}

function menuBlock(title, cmds) {
  let txt = `*『 ${title} 』*\n`;
  for (const c of cmds) txt += `*│ ⬡ ${PREFIX}${c}*\n`;
  txt += `*╰─────────⟢*\n\n`;
  return txt;
}

const MENUS = {
  ai: { title: '🤖 AI Menu', cmds: ['aiart','deepseek','gemini','gpt','imagine','suno','veo3'] },
  download: { title: '📥 Download Menu', cmds: ['apkmirror','facebook','instagram','pinterest','reddit','snapchat','play','tiktok','twitter','video','wallpaper','xnxx','ytplay'] },
  fun: { title: '🎯 Fun Menu', cmds: ['character','compliment','8ball','fact','flirt','goodnight','insult','joke','meme','quote','ship','simp','stupid','wasted'] },
  games: { title: '🎮 Games Menu', cmds: ['dare','endquiz','hangman','quiz','ttt','trivia','truth','wcg'] },
  general: { title: '🌐 General Menu', cmds: ['alive','getpp','gif','github','groupjid','help','owner','ownerinfo','ping','playaudio','reportbug','save','script','simage-alt','sticker-alt','truecaller'] },
  group: { title: '👥 Group Menu', cmds: ['antibadword','antigrouptag','antilink','ban','clear','close','delete','demote','goodbye','antispam','anticontact','antiaudio','antiimage','antivideo','antisticker','antimedia','antibot','antivirus','groupinfo','gstatus','kick','mute','open','poll','promote','resetlink','saveppgc','setgoodbye','setwelcome','staff','tag','tagadmin','tagall','topmembers','unban','unmute','vcf','warn','warnings','welcome'] },
  owner: { title: '🔒 Owner Menu', cmds: ['sudo','alwaysonline','anticall','antidelete','antiedit','autoreactstatus','autoread','autoreply','autotype','autoviewstatus','block','unblock','buttonmode','chatbot','clearsession','cleartmp','enc','join','language','leave','mode','newsletter','pair','plugin','remove','reloadplugins','poststatus','pluginreload','setpp','setprefix','statusmsg','update','vv'] },
  photo: { title: '🎨 Photo Menu', cmds: ['emojimix','removebg','sticker','take'] },
  religion: { title: '✝️ Religion Menu', cmds: ['bible','hymn','quran'] },
  textart: { title: '🔤 Text Art Menu', cmds: ['metallic','ice','snow','impressive','matrix','light','neon','devil','purple','thunder','leaves','1917','arena','hacker','sand','blackpink','glitch','fire'] },
  tools: { title: '💻 Tools Menu', cmds: ['catbox','imdb','lyrics','news','ngl','ss','tgsearch','tomp3','transcribe','translate','trim','tts','weather'] },
};

function getIndex() {
  let txt = header();
  txt += `*『 📑 Index Menu 』*\n*│ Scegli un menu:*\n*│*\n`;
  txt += `*│ ⬡ ${PREFIX}aimenu - AI Menu*\n`;
  txt += `*│ ⬡ ${PREFIX}downloadmenu - Download Menu*\n`;
  txt += `*│ ⬡ ${PREFIX}funmenu - Fun Menu*\n`;
  txt += `*│ ⬡ ${PREFIX}gamesmenu - Games Menu*\n`;
  txt += `*│ ⬡ ${PREFIX}generalmenu - General Menu*\n`;
  txt += `*│ ⬡ ${PREFIX}groupmenu - Group Menu*\n`;
  txt += `*│ ⬡ ${PREFIX}ownermenu - Owner Menu*\n`;
  txt += `*│ ⬡ ${PREFIX}photomenu - Photo Menu*\n`;
  txt += `*│ ⬡ ${PREFIX}religionmenu - Religion Menu*\n`;
  txt += `*│ ⬡ ${PREFIX}textartmenu - Text Art Menu*\n`;
  txt += `*│ ⬡ ${PREFIX}toolsmenu - Tools Menu*\n`;
  txt += `*╰─────────⟢*\n`;
  return txt;
}

function getMenu(key) {
  const m = MENUS[key];
  if (!m) return null;
  return header() + menuBlock(m.title, m.cmds);
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['ShimizuBot', 'Chrome', '1.0.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  if (!sock.authState.creds.registered) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(PAIRING_NUMBER);
        console.log(`\n================================`);
        console.log(`🔑 CODICE PAIRING: ${code}`);
        console.log(`================================\n`);
      } catch (e) { console.log('Errore pairing:', e.message); }
    }, 3000);
  }

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log(`✅ ${BOT_NAME} online!`);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    if (!body.startsWith(PREFIX)) return;
    const args = body.slice(PREFIX.length).trim().split(/ +/);
    const cmd = args[0].toLowerCase();
    const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

    if (['menu','index','help','allmenu'].includes(cmd)) return reply(getIndex());
    if (cmd === 'aimenu') return reply(getMenu('ai'));
    if (cmd === 'downloadmenu') return reply(getMenu('download'));
    if (cmd === 'funmenu') return reply(getMenu('fun'));
    if (cmd === 'gamesmenu') return reply(getMenu('games'));
    if (cmd === 'generalmenu') return reply(getMenu('general'));
    if (cmd === 'groupmenu') return reply(getMenu('group'));
    if (cmd === 'ownermenu') return reply(getMenu('owner'));
    if (cmd === 'photomenu') return reply(getMenu('photo'));
    if (cmd === 'religionmenu') return reply(getMenu('religion'));
    if (cmd === 'textartmenu') return reply(getMenu('textart'));
    if (cmd === 'toolsmenu') return reply(getMenu('tools'));
    if (cmd === 'ping') return reply(`🏓 Pong!`);
    if (cmd === 'alive') return reply(header() + `*✅ ${BOT_NAME} è online!*`);
    if (cmd === 'owner') return reply(`*👤 Owner: ${OWNER_NAME}*`);
    if (cmd === 'ownerinfo') return reply(`*👑 ${BOT_NAME}*\n*👤 Owner: ${OWNER_NAME}*\n*🚀 Versione: ${VERSION}*\n*🌍 Mode: ${MODE}*`);
  });
}

startBot();
