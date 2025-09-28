🌟 Rachel Bot - Tower of God
<div align="center">
Mostrar Imagem
Mostrar Imagem
Mostrar Imagem
Mostrar Imagem

"Eu só quero ver as estrelas..." ✨

Um bot completo para WhatsApp com tema da Rachel de Tower of God (Kami no Tou)

🚀 Instalação • 📋 Comandos • ⚙️ Configuração • 📸 Screenshots

</div>
📖 Sobre
Rachel Bot é um bot avançado para WhatsApp inspirado na personagem Rachel do manhwa Tower of God. Com uma interface temática e funcionalidades completas, ele oferece uma experiência única para grupos e conversas privadas.

✨ Características Principais
🌟 Tema Rachel/Tower of God: Interface e mensagens personalizadas
🔧 Sistema de Comandos: Extensível e personalizável
🎯 Auto Resposta: Respostas inteligentes e temáticas
📱 Multi-sessão: Suporte a múltiplas contas
🛡️ Sistema Admin: Controles administrativos
📊 Logs Detalhados: Sistema completo de logging
🔄 Auto Reconexão: Reconexão automática em caso de falha
💾 Persistência: Sessões e dados salvos automaticamente
🚀 Instalação
Pré-requisitos
Node.js v16 ou superior
Git
Conta WhatsApp
Passo a Passo
Clone o repositório
bash
git clone https://github.com/seu-usuario/rachel-bot.git
cd rachel-bot
Instale as dependências
bash
npm install
Configure o ambiente
bash
cp .env.example .env
nano .env  # ou use seu editor preferido
Configure as permissões
bash
chmod +x start.sh
Inicie o bot
bash
./start.sh
# ou
npm start
Escaneie o QR Code
Abra o WhatsApp no seu celular
Vá em Aparelhos Conectados
Escaneie o QR Code que aparece no terminal
📋 Comandos
🔧 Utilitários
Comando	Descrição	Uso
!ping	Testa a conexão do bot	!ping
!info	Informações do bot	!info
!help	Lista de comandos	!help [comando]
!status	Status detalhado (admin)	!status
🌟 Rachel Especiais
Comando	Descrição	Uso
!torre	Informações sobre a Torre	!torre
!estrelas	Frases sobre estrelas	!estrelas
!rachel	Frases da Rachel	!rachel
!subir	Motivação para subir a Torre	!subir
📱 Mídia
Comando	Descrição	Uso
!sticker	Criar figurinha	!sticker (com imagem)
!toimg	Converter sticker em imagem	!toimg (com sticker)
🎵 Entretenimento
Comando	Descrição	Uso
!play	Tocar música	!play [nome/url]
!lyrics	Letra da música	!lyrics [música]
🛠️ Administrativos
Comando	Descrição	Uso
!kick	Remover membro	!kick @usuario
!ban	Banir usuário	!ban @usuario
!mute	Silenciar usuário	!mute @usuario [tempo]
!promote	Promover a admin	!promote @usuario
⚙️ Configuração
Arquivo .env
O arquivo .env contém todas as configurações do bot:

bash
# Informações básicas
BOT_NAME=Rachel Bot
BOT_PREFIX=!
BOT_OWNER=Seu Nome
SESSION_NAME=rachel_session

# Administração
ADMIN_NUMBERS=5511999999999,5511888888888

# Funcionalidades
AUTO_REPLY=true
SAVE_MESSAGES=true
LOG_LEVEL=info
Personalização
Adicionando Comandos
Crie arquivos na pasta commands/:

javascript
// commands/meucomando.js
module.exports = {
    name: 'meucomando',
    description: 'Meu comando personalizado',
    usage: '!meucomando',
    category: 'Personalizado',
    cooldown: 5,
    execute: async (bot, message, args, from, sender) => {
        await bot.sendMessage(from, 'Olá da Torre!');
    }
};
Frases da Rachel
Adicione frases personalizadas no .env:

bash
RACHEL_QUOTES="Frase 1|Frase 2|Frase 3"
📁 Estrutura do Projeto
rachel-bot/
├── 📄 index.js          # Arquivo principal
├── 📄 conexao.js        # Gerenciamento de conexão
├── 📄 start.sh          # Script de inicialização
├── 📄 package.json      # Dependências
├── 📄 .env.example      # Exemplo de configuração
├── 📁 commands/         # Comandos personalizados
├── 📁 sessions/         # Sessões do WhatsApp
├── 📁 logs/            # Arquivos de log
├── 📁 media/           # Arquivos de mídia
└── 📁 temp/            # Arquivos temporários
🔧 Scripts Disponíveis
bash
npm start          # Iniciar o bot
npm run dev        # Modo desenvolvimento (nodemon)
npm run setup      # Criar diretórios necessários
npm run clean      # Limpar e reinstalar dependências
npm run logs       # Visualizar logs em tempo real
./start.sh         # Script personalizado da Rachel
📊 Monitoramento
Logs
O bot gera logs detalhados em:

Console: Logs coloridos e formatados
Arquivos: logs/YYYY-MM-DD.log
Status
Use !status para ver:

⏰ Tempo online
💬 Mensagens processadas
⚡ Comandos executados
💾 Uso de memória
❌ Erros registrados
🛡️ Segurança
Rate Limiting
Limite de comandos por usuário
Cooldown entre comandos
Anti-spam automático
Controle de Acesso
Sistema de administradores
Comandos restritos
Verificação de permissões
🐛 Solução de Problemas
QR Code não aparece
bash
# Limpe a sessão e reinicie
rm -rf sessions/
npm start
Bot não responde
bash
# Verifique logs
npm run logs
# ou
tail -f logs/$(date +%Y-%m-%d).log
Erro de dependências
bash
# Limpe e reinstale
npm run clean
Problemas de conexão
bash
# Verifique a conexão de internet
# Reinicie o bot
./start.sh
📸 Screenshots
Inicialização
  ██████╗  █████╗  ██████╗██╗  ██╗███████╗██╗     
  ██╔══██╗██╔══██╗██╔════╝██║  ██║██╔════╝██║     
  ██████╔╝███████║██║     ███████║█████╗  ██║     
  ██╔══██╗██╔══██║██║     ██╔══██║██╔══╝  ██║     
  ██║  ██║██║  ██║╚██████╗██║  ██║███████╗███████╗
  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝
           🌟 Tower of God WhatsApp Bot 🌟
        "Eu só quero ver as estrelas..."
Menu de Comandos
🌟 RACHEL BOT - MENU DA TORRE 🌟

👋 Olá! Sou Rachel, sua guia na Torre.
🔧 Prefix: !
📊 Total de comandos: 12

📁 UTILITÁRIOS
!ping - Testar conexão do bot
!info - Informações do bot
!help - Lista de comandos disponíveis
!status - Status detalhado do bot

💡 Dica: Use !help [comando] para mais detalhes

"Vamos subir a Torre juntos!" ✨
🤝 Contribuindo
Fork o projeto
Crie uma branch para sua feature (git checkout -b feature/AmazingFeature)
Commit suas mudanças (git commit -m 'Add: AmazingFeature')
Push para a branch (git push origin feature/AmazingFeature)
Abra um Pull Request
📝 Changelog
v1.0.0 (Atual)
✨ Sistema completo de comandos
🌟 Tema Rachel/Tower of God
🔄 Auto reconexão
📊 Sistema de logs
🛡️ Controles administrativos
🐛 Issues Conhecidos
 Comando de música pode falhar com URLs específicas
 QR Code às vezes demora para aparecer
 Logs podem crescer muito em bots ativos
📚 Recursos Úteis
Documentação Baileys
Tower of God Wiki
Node.js Docs
WhatsApp Business API
❓ FAQ
P: O bot funciona com WhatsApp Business? R: Sim! Funciona tanto com WhatsApp normal quanto Business.

P: Posso usar em múltiplos grupos? R: Sim, o bot pode ser adicionado em vários grupos simultaneamente.

P: Como adiciono novos comandos? R: Crie arquivos na pasta commands/ seguindo o padrão dos existentes.

P: O bot armazena minhas mensagens? R: Apenas logs básicos. Configure SAVE_MESSAGES=false para desativar.

P: Funciona 24/7? R: Sim, com auto-reconexão e tratamento de erros robusto.

🙏 Agradecimentos
SIU - Criador de Tower of God
WhiskeySockets - Biblioteca Baileys
Comunidade Node.js - Ferramentas e suporte
Fãs de Tower of God - Inspiração e feedback
📄 Licença
Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

<div align="center">
Feito com 💜 por fãs de Tower of God

"The stars are waiting for us at the top of the Tower..." ⭐

Mostrar Imagem
Mostrar Imagem
Mostrar Imagem

</div>
