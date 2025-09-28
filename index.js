// ==========================================
// 🌟 RACHEL BOT - TOWER OF GOD 🌟
// Arquivo Principal - index.js
// "I just want to see the stars..."
// ==========================================

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const moment = require('moment-timezone');
const RachelBot = require('./conexao');

// Configurar timezone
moment.tz.setDefault('America/Sao_Paulo');

class RachelBotManager {
    constructor() {
        this.bot = null;
        this.startTime = new Date();
        this.messageCount = 0;
        this.commandCount = 0;
        this.errorCount = 0;
        
        // Configurações avançadas
        this.config = {
            // Informações básicas
            name: process.env.BOT_NAME || 'Rachel Bot',
            version: '1.0.0',
            owner: process.env.BOT_OWNER || 'Torre Admin',
            prefix: process.env.BOT_PREFIX || '!',
            
            // Funcionalidades
            autoReply: process.env.AUTO_REPLY !== 'false',
            welcomeMessage: process.env.WELCOME_MESSAGE || 'Bem-vindo à Torre! Eu sou Rachel, sua guia nesta jornada.',
            helpMessage: process.env.HELP_MESSAGE || 'Como posso ajudá-lo a subir a Torre hoje?',
            
            // Admin
            adminNumbers: process.env.ADMIN_NUMBERS ? process.env.ADMIN_NUMBERS.split(',') : [],
            
            // Logs
            logLevel: process.env.LOG_LEVEL || 'info',
            saveMessages: process.env.SAVE_MESSAGES !== 'false'
        };

        this.setupEventHandlers();
        this.loadCommands();
        this.showStartupInfo();
    }

    // Mostrar informações de inicialização
    showStartupInfo() {
        console.log(chalk.cyan('═'.repeat(60)));
        console.log(chalk.magenta.bold('🌟 RACHEL BOT - TOWER OF GOD INICIANDO 🌟'));
        console.log(chalk.cyan('═'.repeat(60)));
        console.log(chalk.yellow(`📱 Nome: ${this.config.name} v${this.config.version}`));
        console.log(chalk.green(`👑 Owner: ${this.config.owner}`));
        console.log(chalk.blue(`🔧 Prefix: ${this.config.prefix}`));
        console.log(chalk.white(`⏰ Iniciado em: ${moment().format('DD/MM/YYYY HH:mm:ss')}`));
        console.log(chalk.gray(`📊 Node.js: ${process.version}`));
        console.log(chalk.cyan('═'.repeat(60)));
        console.log();
    }

    // Configurar handlers de eventos
    setupEventHandlers() {
        // Graceful shutdown
        process.on('SIGINT', async () => {
            await this.shutdown('SIGINT');
        });

        process.on('SIGTERM', async () => {
            await this.shutdown('SIGTERM');
        });

        // Capturar erros não tratados
        process.on('uncaughtException', (error) => {
            this.log('error', `Erro não capturado: ${error.message}`);
            this.log('error', error.stack);
            this.errorCount++;
        });

        process.on('unhandledRejection', (reason, promise) => {
            this.log('error', `Promise rejeitada: ${reason}`);
            this.errorCount++;
        });
    }

    // Carregar comandos personalizados
    loadCommands() {
        this.commands = new Map();
        
        // Comandos básicos da Rachel
        this.registerBasicCommands();
        
        // Carregar comandos de arquivo se existir
        const commandsPath = path.join(__dirname, 'commands');
        if (fs.existsSync(commandsPath)) {
            this.loadCommandsFromDirectory(commandsPath);
        }
    }

    // Registrar comandos básicos
    registerBasicCommands() {
        // Comando Ping
        this.commands.set('ping', {
            name: 'ping',
            description: 'Testar conexão do bot',
            usage: '!ping',
            category: 'Utilitários',
            cooldown: 3,
            execute: async (bot, message, args, from, sender) => {
                const start = Date.now();
                const msg = await bot.sendMessage(from, '🏓 Calculando...');
                const latency = Date.now() - start;
                
                const response = `🌟 *PONG!* \n\n` +
                               `📡 *Latência:* ${latency}ms\n` +
                               `⏰ *Online há:* ${this.getUptime()}\n` +
                               `💬 *Mensagens processadas:* ${this.messageCount}\n` +
                               `🔥 *Comandos executados:* ${this.commandCount}\n\n` +
                               `_Rachel está ativa na Torre! ✨_`;
                
                await bot.sendMessage(from, response);
            }
        });

        // Comando Info
        this.commands.set('info', {
            name: 'info',
            description: 'Informações do bot',
            usage: '!info',
            category: 'Utilitários',
            cooldown: 5,
            execute: async (bot, message, args, from, sender) => {
                const info = `🌟 *RACHEL BOT - TOWER OF GOD* 🌟\n\n` +
                           `📱 *Nome:* ${this.config.name}\n` +
                           `🔢 *Versão:* ${this.config.version}\n` +
                           `👑 *Owner:* ${this.config.owner}\n` +
                           `🔧 *Prefix:* ${this.config.prefix}\n` +
                           `⏰ *Online desde:* ${moment(this.startTime).format('DD/MM/YYYY HH:mm:ss')}\n` +
                           `📊 *Tempo ativo:* ${this.getUptime()}\n` +
                           `💻 *Plataforma:* ${process.platform}\n` +
                           `🟢 *Node.js:* ${process.version}\n` +
                           `📈 *Memória:* ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n\n` +
                           `_"Eu só quero ver as estrelas..."_ ✨`;
                
                await bot.sendMessage(from, info);
            }
        });

        // Comando Menu/Help
        this.commands.set('help', {
            name: 'help',
            aliases: ['menu', 'ajuda'],
            description: 'Lista de comandos disponíveis',
            usage: '!help [comando]',
            category: 'Utilitários',
            cooldown: 5,
            execute: async (bot, message, args, from, sender) => {
                if (args.length > 0) {
                    // Help de comando específico
                    const cmdName = args[0].toLowerCase();
                    const cmd = this.commands.get(cmdName) || 
                              Array.from(this.commands.values()).find(c => c.aliases && c.aliases.includes(cmdName));
                    
                    if (cmd) {
                        const helpText = `🌟 *Ajuda do Comando*\n\n` +
                                       `📝 *Nome:* ${cmd.name}\n` +
                                       `📋 *Descrição:* ${cmd.description}\n` +
                                       `💡 *Uso:* ${cmd.usage}\n` +
                                       `📁 *Categoria:* ${cmd.category}\n` +
                                       `⏱️ *Cooldown:* ${cmd.cooldown}s\n` +
                                       (cmd.aliases ? `🔗 *Aliases:* ${cmd.aliases.join(', ')}\n` : '') +
                                       `\n_Rachel te ajuda na Torre! 🏗️_`;
                        
                        await bot.sendMessage(from, helpText);
                    } else {
                        await bot.sendMessage(from, '❓ Comando não encontrado. Use !help para ver todos os comandos.');
                    }
                } else {
                    // Menu geral
                    const categories = {};
                    
                    this.commands.forEach(cmd => {
                        if (!categories[cmd.category]) {
                            categories[cmd.category] = [];
                        }
                        categories[cmd.category].push(cmd);
                    });
                    
                    let menu = `🌟 *RACHEL BOT - MENU DA TORRE* 🌟\n\n`;
                    menu += `👋 Olá! Sou Rachel, sua guia na Torre.\n`;
                    menu += `🔧 Prefix: ${this.config.prefix}\n`;
                    menu += `📊 Total de comandos: ${this.commands.size}\n\n`;
                    
                    Object.keys(categories).forEach(category => {
                        menu += `📁 *${category.toUpperCase()}*\n`;
                        categories[category].forEach(cmd => {
                            menu += `${this.config.prefix}${cmd.name} - ${cmd.description}\n`;
                        });
                        menu += `\n`;
                    });
                    
                    menu += `💡 *Dica:* Use ${this.config.prefix}help [comando] para mais detalhes\n`;
                    menu += `\n_"Vamos subir a Torre juntos!" ✨_`;
                    
                    await bot.sendMessage(from, menu);
                }
            }
        });

        // Comando Status
        this.commands.set('status', {
            name: 'status',
            description: 'Status detalhado do bot',
            usage: '!status',
            category: 'Utilitários',
            cooldown: 10,
            adminOnly: true,
            execute: async (bot, message, args, from, sender) => {
                const memUsage = process.memoryUsage();
                const status = `📊 *STATUS DA TORRE* 📊\n\n` +
                             `🟢 *Status:* Online\n` +
                             `⏰ *Uptime:* ${this.getUptime()}\n` +
                             `💬 *Mensagens:* ${this.messageCount}\n` +
                             `⚡ *Comandos:* ${this.commandCount}\n` +
                             `❌ *Erros:* ${this.errorCount}\n\n` +
                             `💾 *MEMÓRIA*\n` +
                             `📈 *Heap Usado:* ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB\n` +
                             `📊 *Heap Total:* ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB\n` +
                             `🔄 *RSS:* ${Math.round(memUsage.rss / 1024 / 1024)}MB\n\n` +
                             `⚙️ *SISTEMA*\n` +
                             `💻 *Plataforma:* ${process.platform}\n` +
                             `🟢 *Node.js:* ${process.version}\n` +
                             `📁 *Diretório:* ${process.cwd()}\n\n` +
                             `_Rachel mantém a Torre funcionando! 🏗️_`;
                
                await bot.sendMessage(from, status);
            }
        });

        this.log('info', `${this.commands.size} comandos carregados com sucesso!`);
    }

    // Carregar comandos de diretório
    loadCommandsFromDirectory(dir) {
        try {
            const files = fs.readdirSync(dir).filter(file => file.endsWith('.js'));
            
            for (const file of files) {
                try {
                    const command = require(path.join(dir, file));
                    if (command.name) {
                        this.commands.set(command.name, command);
                        this.log('info', `Comando carregado: ${command.name}`);
                    }
                } catch (error) {
                    this.log('error', `Erro ao carregar comando ${file}: ${error.message}`);
                }
            }
        } catch (error) {
            this.log('warn', `Diretório de comandos não encontrado: ${dir}`);
        }
    }

    // Inicializar bot
    async initialize() {
        try {
            this.log('rachel', 'Inicializando Rachel Bot...');
            
            this.bot = new RachelBot();
            
            // Sobrescrever o método de processar comandos
            this.setupCommandHandler();
            
            await this.bot.startConnection();
            
        } catch (error) {
            this.log('error', `Erro fatal ao inicializar: ${error.message}`);
            process.exit(1);
        }
    }

    // Configurar handler de comandos personalizado
    setupCommandHandler() {
        const originalHandleCommand = this.bot.handleCommand.bind(this.bot);
        
        this.bot.handleCommand = async (message, body, from, sender, isGroup) => {
            try {
                const args = body.slice(this.config.prefix.length).trim().split(/ +/);
                const commandName = args.shift().toLowerCase();
                
                const command = this.commands.get(commandName) || 
                              Array.from(this.commands.values()).find(cmd => 
                                  cmd.aliases && cmd.aliases.includes(commandName));
                
                if (!command) {
                    // Tentar comando padrão
                    return await originalHandleCommand(message, body, from, sender, isGroup);
                }

                // Verificar se é admin only
                if (command.adminOnly && !this.isAdmin(sender)) {
                    await this.bot.sendMessage(from, '🔒 Este comando é apenas para administradores da Torre.');
                    return;
                }

                // Verificar cooldown (implementação básica)
                // Em produção, você implementaria um sistema mais robusto

                // Executar comando
                this.commandCount++;
                this.log('rachel', `Executando comando: ${command.name}`);
                
                await command.execute(this.bot, message, args, from, sender, isGroup);
                
            } catch (error) {
                this.log('error', `Erro ao executar comando: ${error.message}`);
                await this.bot.sendMessage(from, '❌ Erro interno da Torre. Rachel está investigando...');
                this.errorCount++;
            }
        };

        // Sobrescrever contador de mensagens
        const originalProcessMessage = this.bot.processMessage.bind(this.bot);
        this.bot.processMessage = async (message) => {
            this.messageCount++;
            return await originalProcessMessage(message);
        };
    }

    // Verificar se usuário é admin
    isAdmin(userJid) {
        const userNumber = userJid.split('@')[0];
        return this.config.adminNumbers.includes(userNumber);
    }

    // Obter uptime formatado
    getUptime() {
        const uptime = Date.now() - this.startTime.getTime();
        const duration = moment.duration(uptime);
        
        const days = Math.floor(duration.asDays());
        const hours = duration.hours();
        const minutes = duration.minutes();
        const seconds = duration.seconds();
        
        let result = '';
        if (days > 0) result += `${days}d `;
        if (hours > 0) result += `${hours}h `;
        if (minutes > 0) result += `${minutes}m `;
        result += `${seconds}s`;
        
        return result.trim();
    }

    // Sistema de logs
    log(type, message) {
        const timestamp = moment().format('DD/MM/YYYY HH:mm:ss');
        
        // Log colorido no console
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

        // Salvar em arquivo (opcional)
        if (this.config.logLevel === 'debug' || type === 'error') {
            this.saveLog(type, message, timestamp);
        }
    }

    // Salvar log em arquivo
    saveLog(type, message, timestamp) {
        try {
            const logDir = path.join(__dirname, 'logs');
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }

            const logFile = path.join(logDir, `${moment().format('YYYY-MM-DD')}.log`);
            const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;
            
            fs.appendFileSync(logFile, logEntry);
        } catch (error) {
            console.error('Erro ao salvar log:', error.message);
        }
    }

    // Shutdown graceful
    async shutdown(signal) {
        this.log('rachel', `Recebido sinal ${signal}. Rachel está saindo da Torre...`);
        
        if (this.bot) {
            try {
                await this.bot.stop();
            } catch (error) {
                this.log('error', `Erro ao parar bot: ${error.message}`);
            }
        }

        this.log('rachel', 'Até logo! As estrelas me esperam... ✨');
        process.exit(0);
    }

    // Getter para estatísticas
    get stats() {
        return {
            startTime: this.startTime,
            messageCount: this.messageCount,
            commandCount: this.commandCount,
            errorCount: this.errorCount,
            uptime: this.getUptime(),
            commands: this.commands.size
        };
    }
}

// Inicialização
async function main() {
    try {
        const rachelManager = new RachelBotManager();
        await rachelManager.initialize();
    } catch (error) {
        console.error(chalk.red('❌ Erro fatal:'), error.message);
        process.exit(1);
    }
}

// Verificar se está sendo executado diretamente
if (require.main === module) {
    main();
}

module.exports = RachelBotManager;
