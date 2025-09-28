// ==========================================
// 🌟 RACHEL BOT - TOWER OF GOD 🌟
// Conexão WhatsApp com Baileys
// "I just want to see the stars..."
// ==========================================

const { 
    default: makeWASocket, 
    DisconnectReason, 
    useMultiFileAuthState,
    makeInMemoryStore,
    Browsers,
    delay,
    isJidBroadcast,
    isJidStatusBroadcast,
    proto,
    getContentType
} = require('@whiskeysockets/baileys');

const P = require('pino');
const fs = require('fs');
const chalk = require('chalk');
const figlet = require('figlet');
const qrcode = require('qrcode-terminal');
const NodeCache = require('node-cache');

// Cache para mensagens
const msgRetryCounterCache = new NodeCache();

// Store para gerenciar mensagens
const store = makeInMemoryStore({ 
    logger: P().child({ level: 'silent', stream: 'store' }) 
});

class RachelBot {
    constructor() {
        this.sock = null;
        this.isConnected = false;
        this.qrAttempts = 0;
        this.maxQrAttempts = 5;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        
        // Configurações da Rachel
        this.config = {
            botName: process.env.BOT_NAME || 'Rachel Bot',
            prefix: process.env.BOT_PREFIX || '!',
            owner: process.env.BOT_OWNER || 'Torre Admin',
            sessionName: process.env.SESSION_NAME || 'rachel_session',
            autoReply: process.env.AUTO_REPLY === 'true' || true
        };

        this.initLogger();
        this.showBanner();
    }

    // Logger personalizado da Rachel
    initLogger() {
        this.logger = P({
            timestamp: () => `,"time":"${new Date().toISOString()}"`,
            level: 'info'
        }).child({});
    }

    // Banner da Rachel
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
        
        switch(type) {
            case 'info':
                console.log(chalk.green(`[${timestamp}] ℹ️  ${message}`));
                break;
            case 'warn':
                console.log(chalk.yellow(`[${timestamp}] ⚠️  ${message}`));
                break;
            case 'error':
                console.log(chalk.red(`[${timestamp}] ❌ ${message}`));
                break;
            case 'rachel':
                console.log(chalk.magenta(`[${timestamp}] 🌟 Rachel: ${message}`));
                break;
            case 'tower':
                console.log(chalk.cyan(`[${timestamp}] 🏗️  Torre: ${message}`));
                break;
            default:
                console.log(chalk.white(`[${timestamp}] ${message}`));
        }
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

    // Inicializar conexão
    async startConnection() {
        try {
            await this.createDirectories();
            
            this.log('rachel', 'Preparando para subir a Torre...');
            
            // Configurar autenticação
            const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${this.config.sessionName}`);
            
            // Configurar socket
            this.sock = makeWASocket({
                logger: this.logger,
                printQRInTerminal: false, // Vamos customizar o QR
                auth: state,
                browser: Browsers.macOS('Desktop'),
                markOnlineOnConnect: true,
                generateHighQualityLinkPreview: true,
                msgRetryCounterCache,
                defaultQueryTimeoutMs: undefined,
                keepAliveIntervalMs: 30000,
                emitOwnEvents: false,
                fireInitQueries: true,
                version: [2, 2413, 1]
            });

            // Bind store
            store.bind(this.sock.ev);

            // Event Listeners
            this.setupEventListeners(saveCreds);
            
        } catch (error) {
            this.log('error', `Erro ao inicializar conexão: ${error.message}`);
            await this.handleReconnect();
        }
    }

    // Configurar event listeners
    setupEventListeners(saveCreds) {
        // Atualização de credenciais
        this.sock.ev.on('creds.update', saveCreds);

        // QR Code
        this.sock.ev.on('connection.update', async (update) => {
            await this.handleConnectionUpdate(update);
        });

        // Mensagens recebidas
        this.sock.ev.on('messages.upsert', async (m) => {
            await this.handleMessages(m);
        });

        // Presença (online/offline)
        this.sock.ev.on('presence.update', (presence) => {
            this.handlePresenceUpdate(presence);
        });

        // Grupos
        this.sock.ev.on('groups.upsert', (groups) => {
            this.handleGroupsUpdate(groups);
        });

        // Contatos
        this.sock.ev.on('contacts.update', (contacts) => {
            this.handleContactsUpdate(contacts);
        });
    }

    // Gerenciar atualizações de conexão
    async handleConnectionUpdate(update) {
        const { connection, lastDisconnect, qr } = update;

        // QR Code
        if (qr) {
            this.qrAttempts++;
            this.log('rachel', `Mostrando QR Code (Tentativa ${this.qrAttempts}/${this.maxQrAttempts})`);
            
            console.log(chalk.yellow('\n📱 Escaneie o QR Code abaixo com seu WhatsApp:\n'));
            qrcode.generate(qr, { small: true });
            console.log(chalk.gray('\n⏳ Aguardando escaneamento...\n'));

            if (this.qrAttempts >= this.maxQrAttempts) {
                this.log('error', 'Máximo de tentativas de QR atingido');
                process.exit(1);
            }
        }

        // Estado da conexão
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            const reason = lastDisconnect?.error?.output?.statusCode;

            this.isConnected = false;
            this.handleDisconnection(reason, shouldReconnect);

        } else if (connection === 'open') {
            this.isConnected = true;
            this.qrAttempts = 0;
            this.reconnectAttempts = 0;
            
            this.log('rachel', 'Conectada à Torre com sucesso! 🌟');
            this.log('tower', `Bot ${this.config.botName} está online!`);
            
            // Enviar mensagem de status (opcional)
            await this.sendStartupMessage();
        }
    }

    // Gerenciar desconexões
    handleDisconnection(reason, shouldReconnect) {
        const reasons = {
            [DisconnectReason.badSession]: 'Sessão ruim',
            [DisconnectReason.connectionClosed]: 'Conexão fechada',
            [DisconnectReason.connectionLost]: 'Conexão perdida',
            [DisconnectReason.connectionReplaced]: 'Conexão substituída',
            [DisconnectReason.timedOut]: 'Tempo esgotado',
            [DisconnectReason.loggedOut]: 'Deslogado',
            [DisconnectReason.restartRequired]: 'Reinício necessário'
        };

        const reasonText = reasons[reason] || 'Motivo desconhecido';
        this.log('warn', `Desconectado: ${reasonText} (${reason})`);

        if (shouldReconnect) {
            this.handleReconnect();
        } else {
            this.log('rachel', 'Rachel foi deslogada da Torre. Reinicie para reconectar.');
            process.exit(1);
        }
    }

    // Gerenciar reconexão
    async handleReconnect() {
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts > this.maxReconnectAttempts) {
            this.log('error', 'Máximo de tentativas de reconexão atingido');
            process.exit(1);
        }

        const delay = Math.min(this.reconnectAttempts * 5000, 30000);
        this.log('rachel', `Tentando reconectar em ${delay/1000}s... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            this.startConnection();
        }, delay);
    }

    // Gerenciar mensagens recebidas
    async handleMessages(m) {
        try {
            const messages = m.messages;
            if (!messages || messages.length === 0) return;

            for (const message of messages) {
                // Ignorar mensagens de status e broadcast
                if (message.key && (message.key.remoteJid === 'status@broadcast' || 
                    isJidBroadcast(message.key.remoteJid) || 
                    isJidStatusBroadcast(message.key.remoteJid))) {
                    continue;
                }

                // Ignorar mensagens próprias
                if (message.key.fromMe) continue;

                await this.processMessage(message);
            }
        } catch (error) {
            this.log('error', `Erro ao processar mensagem: ${error.message}`);
        }
    }

    // Processar mensagem individual
    async processMessage(message) {
        try {
            const messageType = getContentType(message.message);
            const from = message.key.remoteJid;
            const isGroup = from.endsWith('@g.us');
            const sender = message.key.participant || from;
            
            // Extrair texto da mensagem
            let bodyMessage = '';
            if (messageType === 'conversation') {
                bodyMessage = message.message.conversation;
            } else if (messageType === 'extendedTextMessage') {
                bodyMessage = message.message.extendedTextMessage.text;
            } else if (messageType === 'imageMessage' && message.message.imageMessage.caption) {
                bodyMessage = message.message.imageMessage.caption;
            } else if (messageType === 'videoMessage' && message.message.videoMessage.caption) {
                bodyMessage = message.message.videoMessage.caption;
            }

            if (!bodyMessage) return;

            // Log da mensagem
            const senderName = message.pushName || sender.split('@')[0];
            const chatName = isGroup ? 'Grupo' : 'Privado';
            this.log('info', `📨 ${chatName} - ${senderName}: ${bodyMessage.substring(0, 50)}${bodyMessage.length > 50 ? '...' : ''}`);

            // Verificar se é comando
            if (bodyMessage.startsWith(this.config.prefix)) {
                await this.handleCommand(message, bodyMessage, from, sender, isGroup);
            } else if (this.config.autoReply) {
                await this.handleAutoReply(message, bodyMessage, from, sender, isGroup);
            }

        } catch (error) {
            this.log('error', `Erro ao processar mensagem individual: ${error.message}`);
        }
    }

    // Gerenciar comandos
    async handleCommand(message, body, from, sender, isGroup) {
        const command = body.slice(this.config.prefix.length).trim().split(' ')[0].toLowerCase();
        const args = body.slice(this.config.prefix.length).trim().split(' ').slice(1);

        this.log('rachel', `Comando recebido: ${command}`);

        switch (command) {
            case 'ping':
                await this.sendMessage(from, '🏓 Pong! Rachel está ativa na Torre!');
                break;
                
            case 'info':
                const info = `🌟 *Rachel Bot - Tower of God*\n\n` +
                           `📱 *Nome:* ${this.config.botName}\n` +
                           `👑 *Owner:* ${this.config.owner}\n` +
                           `🔧 *Prefix:* ${this.config.prefix}\n` +
                           `⏰ *Online desde:* ${new Date().toLocaleString('pt-BR')}\n\n` +
                           `_"Eu só quero ver as estrelas..."_`;
                await this.sendMessage(from, info);
                break;
                
            case 'help':
            case 'menu':
                const menu = `🌟 *RACHEL BOT - MENU DA TORRE*\n\n` +
                           `📋 *Comandos Disponíveis:*\n\n` +
                           `${this.config.prefix}ping - Testar bot\n` +
                           `${this.config.prefix}info - Informações do bot\n` +
                           `${this.config.prefix}help - Este menu\n` +
                           `${this.config.prefix}sticker - Criar figurinha\n` +
                           `${this.config.prefix}clima - Ver clima\n\n` +
                           `_Rachel te guiará pela Torre! 🌟_`;
                await this.sendMessage(from, menu);
                break;
                
            default:
                await this.sendMessage(from, '❓ Comando não reconhecido. Use !help para ver os comandos disponíveis.');
        }
    }

    // Auto resposta (opcional)
    async handleAutoReply(message, body, from, sender, isGroup) {
        // Respostas automáticas temáticas da Rachel
        const lowerBody = body.toLowerCase();
        
        if (lowerBody.includes('oi') || lowerBody.includes('olá') || lowerBody.includes('hey')) {
            await this.sendMessage(from, '🌟 Olá! Sou Rachel, sua guia na Torre. Como posso ajudar?');
        } else if (lowerBody.includes('torre') || lowerBody.includes('tower')) {
            await this.sendMessage(from, '🏗️ A Torre é cheia de mistérios... Quer explorar comigo?');
        } else if (lowerBody.includes('estrelas') || lowerBody.includes('stars')) {
            await this.sendMessage(from, '✨ Um dia verei as estrelas reais... Esse é meu sonho.');
        }
    }

    // Enviar mensagem
    async sendMessage(jid, text, options = {}) {
        try {
            if (!this.isConnected) {
                this.log('warn', 'Bot não está conectado');
                return;
            }

            await this.sock.sendMessage(jid, { text }, options);
            this.log('rachel', `Mensagem enviada para ${jid.split('@')[0]}`);
        } catch (error) {
            this.log('error', `Erro ao enviar mensagem: ${error.message}`);
        }
    }

    // Mensagem de startup (opcional)
    async sendStartupMessage() {
        const ownerNumber = process.env.ADMIN_NUMBERS;
        if (ownerNumber) {
            const message = `🌟 *Rachel Bot Online!*\n\n` +
                          `A Torre está pronta para ser explorada!\n` +
                          `Hora: ${new Date().toLocaleString('pt-BR')}\n\n` +
                          `_"Vamos subir a Torre juntos!"_ ✨`;
            
            try {
                await this.sendMessage(`${ownerNumber}@s.whatsapp.net`, message);
            } catch (error) {
                this.log('warn', 'Não foi possível enviar mensagem de startup');
            }
        }
    }

    // Gerenciar updates de presença
    handlePresenceUpdate(presence) {
        // Log de presença se necessário
        // this.log('info', `Presença atualizada: ${presence.id}`);
    }

    // Gerenciar updates de grupos
    handleGroupsUpdate(groups) {
        for (const group of groups) {
            this.log('tower', `Novo grupo detectado: ${group.subject}`);
        }
    }

    // Gerenciar updates de contatos
    handleContactsUpdate(contacts) {
        // Log de contatos se necessário
        // this.log('info', `${contacts.length} contatos atualizados`);
    }

    // Método para parar o bot
    async stop() {
        if (this.sock) {
            this.log('rachel', 'Rachel está saindo da Torre...');
            await this.sock.logout();
            this.sock = null;
            this.isConnected = false;
        }
    }

    // Getter para verificar se está conectado
    get connected() {
        return this.isConnected;
    }

    // Getter para o socket
    get socket() {
        return this.sock;
    }
}

module.exports = RachelBot;
