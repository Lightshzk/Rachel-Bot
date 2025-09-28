// ==========================================
// 🌟 RACHEL BOT - TOWER OF GOD 🌟
// Conexão WhatsApp com Baileys (versão otimizada)
// "I just want to see the stars..."
// ==========================================

const { 
    default: makeWASocket, 
    DisconnectReason, 
    useMultiFileAuthState,
    makeInMemoryStore,
    Browsers,
    isJidBroadcast,
    isJidStatusBroadcast,
    proto,
    getContentType,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const P = require('pino');
const fs = require('fs');
const chalk = require('chalk');
const figlet = require('figlet');
const qrcode = require('qrcode-terminal');
const NodeCache = require('node-cache');
const path = require('path');

// Cache para mensagens
const msgRetryCounterCache = new NodeCache();

// Store para gerenciar mensagens
const store = makeInMemoryStore({ 
    logger: P().child({ level: 'silent', stream: 'store' }) 
});

// Anti-flood básico (limite de 1 mensagem a cada 2s por usuário)
const userCooldown = new Map();

class RachelBot {
    constructor() {
        this.sock = null;
        this.isConnected = false;
        this.qrAttempts = 0;
        this.maxQrAttempts = 5;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;

        // Configurações
        this.config = {
            botName: process.env.BOT_NAME || 'Rachel Bot',
            prefix: process.env.BOT_PREFIX || '!',
            owner: process.env.BOT_OWNER || 'Torre Admin',
            sessionName: process.env.SESSION_NAME || 'rachel_session',
            autoReply: process.env.AUTO_REPLY === 'true' // fix do bug
        };

        this.initLogger();
        this.showBanner();
        this.loadCommands();
    }

    // Logger personalizado
    initLogger() {
        this.logger = P({
            timestamp: () => `,"time":"${new Date().toISOString()}"`,
            level: 'info'
        }).child({});
    }

    // Banner
    showBanner() {
        console.clear();
        console.log(chalk.magenta(figlet.textSync('RACHEL', {
            font: 'ANSI Shadow',
            horizontalLayout: 'fitted'
        })));
        console.log(chalk.cyan('🌟 Tower of God WhatsApp Bot 🌟'));
        console.log(chalk.yellow('"Eu só quero ver as estrelas..."'));
        console.log(chalk.gray('═'.repeat(50)));
        console.log('');
    }

    // Log estilizado
    log(type, message) {
        const timestamp = new Date().toLocaleString('pt-BR');
        const types = {
            info: chalk.green,
            warn: chalk.yellow,
            error: chalk.red,
            rachel: chalk.magenta,
            tower: chalk.cyan
        };
        const emoji = {
            info: 'ℹ️',
            warn: '⚠️',
            error: '❌',
            rachel: '🌟 Rachel:',
            tower: '🏗️ Torre:'
        };
        console.log(types[type](`[${timestamp}] ${emoji[type] || ''} ${message}`));
    }

    // Criar diretórios necessários
    async createDirectories() {
        const dirs = ['./sessions', './logs', './media', './temp'];
        for (const dir of dirs) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                this.log('info', `Diretório criado: ${dir}`);
            }
        }
    }

    // Carregar comandos modularizados
    loadCommands() {
        this.commands = new Map();
        const commandsPath = path.join(__dirname, 'commands');
        if (!fs.existsSync(commandsPath)) return;

        const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
        for (const file of files) {
            const command = require(path.join(commandsPath, file));
            if (command.name && typeof command.run === 'function') {
                this.commands.set(command.name, command);
                this.log('info', `Comando carregado: ${command.name}`);
            }
        }
    }

    // Inicializar conexão
    async startConnection() {
        try {
            await this.createDirectories();
            this.log('rachel', 'Preparando para subir a Torre...');

            const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${this.config.sessionName}`);
            const { version } = await fetchLatestBaileysVersion();

            this.sock = makeWASocket({
                logger: this.logger,
                printQRInTerminal: false,
                auth: state,
                browser: Browsers.macOS('Desktop'),
                markOnlineOnConnect: true,
                generateHighQualityLinkPreview: true,
                msgRetryCounterCache,
                version
            });

            store.bind(this.sock.ev);
            this.setupEventListeners(saveCreds);

        } catch (error) {
            this.log('error', `Erro ao inicializar conexão: ${error.message}`);
            await this.handleReconnect();
        }
    }

    // Configurar eventos
    setupEventListeners(saveCreds) {
        this.sock.ev.on('creds.update', saveCreds);
        this.sock.ev.on('connection.update', async (update) => {
            await this.handleConnectionUpdate(update);
        });
        this.sock.ev.on('messages.upsert', async (m) => {
            await this.handleMessages(m);
        });
    }

    // Atualização de conexão
    async handleConnectionUpdate(update) {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            this.qrAttempts++;
            this.log('rachel', `Mostrando QR Code (Tentativa ${this.qrAttempts}/${this.maxQrAttempts})`);
            qrcode.generate(qr, { small: true });
            if (this.qrAttempts >= this.maxQrAttempts) {
                this.log('error', 'Máximo de tentativas de QR atingido');
                process.exit(1);
            }
        }
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            this.isConnected = false;
            if (shouldReconnect) this.handleReconnect();
            else {
                this.log('rachel', 'Rachel foi deslogada da Torre.');
                process.exit(1);
            }
        } else if (connection === 'open') {
            this.isConnected = true;
            this.qrAttempts = 0;
            this.reconnectAttempts = 0;
            this.log('rachel', 'Conectada à Torre com sucesso! 🌟');
        }
    }

    // Reconexão
    async handleReconnect() {
        this.reconnectAttempts++;
        if (this.reconnectAttempts > this.maxReconnectAttempts) {
            this.log('error', 'Máximo de tentativas de reconexão atingido');
            process.exit(1);
        }
        const delay = Math.min(this.reconnectAttempts * 5000, 30000);
        this.log('rachel', `Tentando reconectar em ${delay/1000}s...`);
        setTimeout(() => this.startConnection(), delay);
    }

    // Mensagens recebidas
    async handleMessages(m) {
        const messages = m.messages;
        if (!messages || messages.length === 0) return;

        for (const msg of messages) {
            if (msg.key.fromMe || !msg.message) continue;
            if (msg.key.remoteJid === 'status@broadcast' || isJidBroadcast(msg.key.remoteJid)) continue;

            const from = msg.key.remoteJid;
            const sender = msg.key.participant || from;
            const body = this.extractText(msg);

            if (!body) return;

            // Anti-flood
            const lastTime = userCooldown.get(sender) || 0;
            const now = Date.now();
            if (now - lastTime < 2000) {
                this.log('warn', `Flood detectado de ${sender}`);
                return;
            }
            userCooldown.set(sender, now);

            if (body.startsWith(this.config.prefix)) {
                await this.runCommand(body, msg, from, sender);
            } else if (this.config.autoReply) {
                await this.handleAutoReply(body, from);
            }
        }
    }

    // Extrair texto
    extractText(message) {
        const type = getContentType(message.message);
        switch (type) {
            case 'conversation': return message.message.conversation;
            case 'extendedTextMessage': return message.message.extendedTextMessage.text;
            case 'imageMessage': return message.message.imageMessage.caption;
            case 'videoMessage': return message.message.videoMessage.caption;
            default: return '';
        }
    }

    // Rodar comando
    async runCommand(body, msg, from, sender) {
        const [cmdName, ...args] = body.slice(this.config.prefix.length).trim().split(/\s+/);
        const command = this.commands.get(cmdName.toLowerCase());
        if (command) {
            this.log('rachel', `Executando comando: ${cmdName}`);
            await command.run(this, msg, from, sender, args);
        } else {
            await this.sendMessage(from, '❓ Comando não reconhecido. Use !help para ver os comandos.');
        }
    }

    // Auto reply
    async handleAutoReply(text, from) {
        const lower = text.toLowerCase();
        if (lower.includes('oi')) {
            await this.sendMessage(from, '🌟 Olá! Sou Rachel, sua guia na Torre.');
        } else if (lower.includes('torre')) {
            await this.sendMessage(from, '🏗️ A Torre é cheia de mistérios...');
        } else if (lower.includes('estrela')) {
            await this.sendMessage(from, '✨ Um dia verei as estrelas reais...');
        }
    }

    // Enviar mensagem
    async sendMessage(jid, text, options = {}) {
        if (!this.isConnected) return;
        try {
            await this.sock.sendMessage(jid, { text }, options);
            this.log('info', `Mensagem enviada para ${jid}`);
        } catch (e) {
            this.log('error', `Erro ao enviar mensagem: ${e.message}`);
        }
    }
}

module.exports = RachelBot;
// ==========================================
// 🌟 RACHEL BOT - TOWER OF GOD 🌟
// Conexão WhatsApp com Baileys (versão otimizada)
// "I just want to see the stars..."
// ==========================================

const { 
    default: makeWASocket, 
    DisconnectReason, 
    useMultiFileAuthState,
    makeInMemoryStore,
    Browsers,
    isJidBroadcast,
    isJidStatusBroadcast,
    proto,
    getContentType,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const P = require('pino');
const fs = require('fs');
const chalk = require('chalk');
const figlet = require('figlet');
const qrcode = require('qrcode-terminal');
const NodeCache = require('node-cache');
const path = require('path');

// Cache para mensagens
const msgRetryCounterCache = new NodeCache();

// Store para gerenciar mensagens
const store = makeInMemoryStore({ 
    logger: P().child({ level: 'silent', stream: 'store' }) 
});

// Anti-flood básico (limite de 1 mensagem a cada 2s por usuário)
const userCooldown = new Map();

class RachelBot {
    constructor() {
        this.sock = null;
        this.isConnected = false;
        this.qrAttempts = 0;
        this.maxQrAttempts = 5;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;

        // Configurações
        this.config = {
            botName: process.env.BOT_NAME || 'Rachel Bot',
            prefix: process.env.BOT_PREFIX || '!',
            owner: process.env.BOT_OWNER || 'Torre Admin',
            sessionName: process.env.SESSION_NAME || 'rachel_session',
            autoReply: process.env.AUTO_REPLY === 'true' // fix do bug
        };

        this.initLogger();
        this.showBanner();
        this.loadCommands();
    }

    // Logger personalizado
    initLogger() {
        this.logger = P({
            timestamp: () => `,"time":"${new Date().toISOString()}"`,
            level: 'info'
        }).child({});
    }

    // Banner
    showBanner() {
        console.clear();
        console.log(chalk.magenta(figlet.textSync('RACHEL', {
            font: 'ANSI Shadow',
            horizontalLayout: 'fitted'
        })));
        console.log(chalk.cyan('🌟 Tower of God WhatsApp Bot 🌟'));
        console.log(chalk.yellow('"Eu só quero ver as estrelas..."'));
        console.log(chalk.gray('═'.repeat(50)));
        console.log('');
    }

    // Log estilizado
    log(type, message) {
        const timestamp = new Date().toLocaleString('pt-BR');
        const types = {
            info: chalk.green,
            warn: chalk.yellow,
            error: chalk.red,
            rachel: chalk.magenta,
            tower: chalk.cyan
        };
        const emoji = {
            info: 'ℹ️',
            warn: '⚠️',
            error: '❌',
            rachel: '🌟 Rachel:',
            tower: '🏗️ Torre:'
        };
        console.log(types[type](`[${timestamp}] ${emoji[type] || ''} ${message}`));
    }

    // Criar diretórios necessários
    async createDirectories() {
        const dirs = ['./sessions', './logs', './media', './temp'];
        for (const dir of dirs) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                this.log('info', `Diretório criado: ${dir}`);
            }
        }
    }

    // Carregar comandos modularizados
    loadCommands() {
        this.commands = new Map();
        const commandsPath = path.join(__dirname, 'commands');
        if (!fs.existsSync(commandsPath)) return;

        const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
        for (const file of files) {
            const command = require(path.join(commandsPath, file));
            if (command.name && typeof command.run === 'function') {
                this.commands.set(command.name, command);
                this.log('info', `Comando carregado: ${command.name}`);
            }
        }
    }

    // Inicializar conexão
    async startConnection() {
        try {
            await this.createDirectories();
            this.log('rachel', 'Preparando para subir a Torre...');

            const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${this.config.sessionName}`);
            const { version } = await fetchLatestBaileysVersion();

            this.sock = makeWASocket({
                logger: this.logger,
                printQRInTerminal: false,
                auth: state,
                browser: Browsers.macOS('Desktop'),
                markOnlineOnConnect: true,
                generateHighQualityLinkPreview: true,
                msgRetryCounterCache,
                version
            });

            store.bind(this.sock.ev);
            this.setupEventListeners(saveCreds);

        } catch (error) {
            this.log('error', `Erro ao inicializar conexão: ${error.message}`);
            await this.handleReconnect();
        }
    }

    // Configurar eventos
    setupEventListeners(saveCreds) {
        this.sock.ev.on('creds.update', saveCreds);
        this.sock.ev.on('connection.update', async (update) => {
            await this.handleConnectionUpdate(update);
        });
        this.sock.ev.on('messages.upsert', async (m) => {
            await this.handleMessages(m);
        });
    }

    // Atualização de conexão
    async handleConnectionUpdate(update) {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            this.qrAttempts++;
            this.log('rachel', `Mostrando QR Code (Tentativa ${this.qrAttempts}/${this.maxQrAttempts})`);
            qrcode.generate(qr, { small: true });
            if (this.qrAttempts >= this.maxQrAttempts) {
                this.log('error', 'Máximo de tentativas de QR atingido');
                process.exit(1);
            }
        }
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            this.isConnected = false;
            if (shouldReconnect) this.handleReconnect();
            else {
                this.log('rachel', 'Rachel foi deslogada da Torre.');
                process.exit(1);
            }
        } else if (connection === 'open') {
            this.isConnected = true;
            this.qrAttempts = 0;
            this.reconnectAttempts = 0;
            this.log('rachel', 'Conectada à Torre com sucesso! 🌟');
        }
    }

    // Reconexão
    async handleReconnect() {
        this.reconnectAttempts++;
        if (this.reconnectAttempts > this.maxReconnectAttempts) {
            this.log('error', 'Máximo de tentativas de reconexão atingido');
            process.exit(1);
        }
        const delay = Math.min(this.reconnectAttempts * 5000, 30000);
        this.log('rachel', `Tentando reconectar em ${delay/1000}s...`);
        setTimeout(() => this.startConnection(), delay);
    }

    // Mensagens recebidas
    async handleMessages(m) {
        const messages = m.messages;
        if (!messages || messages.length === 0) return;

        for (const msg of messages) {
            if (msg.key.fromMe || !msg.message) continue;
            if (msg.key.remoteJid === 'status@broadcast' || isJidBroadcast(msg.key.remoteJid)) continue;

            const from = msg.key.remoteJid;
            const sender = msg.key.participant || from;
            const body = this.extractText(msg);

            if (!body) return;

            // Anti-flood
            const lastTime = userCooldown.get(sender) || 0;
            const now = Date.now();
            if (now - lastTime < 2000) {
                this.log('warn', `Flood detectado de ${sender}`);
                return;
            }
            userCooldown.set(sender, now);

            if (body.startsWith(this.config.prefix)) {
                await this.runCommand(body, msg, from, sender);
            } else if (this.config.autoReply) {
                await this.handleAutoReply(body, from);
            }
        }
    }

    // Extrair texto
    extractText(message) {
        const type = getContentType(message.message);
        switch (type) {
            case 'conversation': return message.message.conversation;
            case 'extendedTextMessage': return message.message.extendedTextMessage.text;
            case 'imageMessage': return message.message.imageMessage.caption;
            case 'videoMessage': return message.message.videoMessage.caption;
            default: return '';
        }
    }

    // Rodar comando
    async runCommand(body, msg, from, sender) {
        const [cmdName, ...args] = body.slice(this.config.prefix.length).trim().split(/\s+/);
        const command = this.commands.get(cmdName.toLowerCase());
        if (command) {
            this.log('rachel', `Executando comando: ${cmdName}`);
            await command.run(this, msg, from, sender, args);
        } else {
            await this.sendMessage(from, '❓ Comando não reconhecido. Use !help para ver os comandos.');
        }
    }

    // Auto reply
    async handleAutoReply(text, from) {
        const lower = text.toLowerCase();
        if (lower.includes('oi')) {
            await this.sendMessage(from, '🌟 Olá! Sou Rachel, sua guia na Torre.');
        } else if (lower.includes('torre')) {
            await this.sendMessage(from, '🏗️ A Torre é cheia de mistérios...');
        } else if (lower.includes('estrela')) {
            await this.sendMessage(from, '✨ Um dia verei as estrelas reais...');
        }
    }

    // Enviar mensagem
    async sendMessage(jid, text, options = {}) {
        if (!this.isConnected) return;
        try {
            await this.sock.sendMessage(jid, { text }, options);
            this.log('info', `Mensagem enviada para ${jid}`);
        } catch (e) {
            this.log('error', `Erro ao enviar mensagem: ${e.message}`);
        }
    }
}

module.exports = RachelBot;
