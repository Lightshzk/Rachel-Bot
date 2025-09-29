# 🌟 Rachel Bot - Tower of God

<div align="center">

![Rachel Bot Banner](https://i.imgur.com/placeholder-banner.png)

![GitHub Stars](https://img.shields.io/github/stars/Lightshzk/Rachel-Bot?style=for-the-badge&color=purple)
![GitHub Forks](https://img.shields.io/github/forks/Lightshzk/Rachel-Bot?style=for-the-badge&color=blue)
![GitHub Issues](https://img.shields.io/github/issues/Lightshzk/Rachel-Bot?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-16%2B-green?style=for-the-badge&logo=node.js)
![WhatsApp](https://img.shields.io/badge/WhatsApp-Bot-25D366?style=for-the-badge&logo=whatsapp)
![License](https://img.shields.io/github/license/Lightshzk/Rachel-Bot?style=for-the-badge)

### _"Eu só quero ver as estrelas..."_ ✨

**Bot completo para WhatsApp inspirado na Rachel de Tower of God (Kami no Tou)**

[📥 Instalação](#-instalação) •
[📋 Comandos](#-comandos) •
[⚙️ Configuração](#️-configuração) •
[🪟 Windows](#-windows) •
[🤝 Contribuir](#-contribuindo)

---

</div>

## 🎯 Sobre o Projeto

Rachel Bot é um bot avançado para WhatsApp que traz a magia de **Tower of God** para suas conversas! Inspirado na icônica personagem Rachel, o bot oferece uma experiência única com tema completo do manhwa, funcionalidades robustas e uma interface que faz você se sentir subindo a Torre.

### ⭐ Por que escolher Rachel Bot?

- 🌟 **100% Temático** - Design e mensagens inspiradas em Tower of God
- 🚀 **Fácil de usar** - Instalação automática em um comando
- 🛡️ **Seguro** - Não salva suas mensagens, totalmente privado
- 🔧 **Personalizável** - Adicione seus próprios comandos facilmente
- 📱 **Multi-plataforma** - Funciona em Linux, macOS e Windows
- 🆓 **Gratuito** - 100% open source, sem custos ocultos

## ✨ Principais Recursos

<table>
<tr>
<td width="50%">

### 🎮 **Comandos Inteligentes**
- Sistema de prefixo personalizável
- Cooldown automático
- Suporte a aliases
- Help contextual detalhado

</td>
<td width="50%">

### 👑 **Sistema Admin**
- Controles administrativos
- Comandos exclusivos
- Gerenciamento de grupos
- Logs detalhados em tempo real

</td>
</tr>
<tr>
<td width="50%">

### 🌐 **Multi-sessão**
- Múltiplas contas simultâneas
- Reconexão automática
- QR Code personalizado
- Sessões seguras criptografadas

</td>
<td width="50%">

### 🎨 **Experiência Temática**
- Interface da Rachel
- Frases do manhwa
- Cores temáticas (roxo/magenta)
- Emojis personalizados da Torre

</td>
</tr>
</table>

## 📥 Instalação

### 🐧 **Linux / macOS**

#### Instalação Automática (Recomendado):
```bash
curl -fsSL https://raw.githubusercontent.com/Lightshzk/Rachel-Bot/main/install.sh | bash
```

#### Instalação Manual:
```bash
# 1. Clonar repositório
git clone https://github.com/Lightshzk/Rachel-Bot.git
cd Rachel-Bot

# 2. Instalar dependências
npm install

# 3. Configurar ambiente
cp .env.example .env
nano .env  # Configure suas variáveis

# 4. Dar permissões e iniciar
chmod +x start.sh
./start.sh
```

### 🪟 **Windows**

#### Instalação Automática:
```batch
# PowerShell como Administrador
git clone https://github.com/Lightshzk/Rachel-Bot.git
cd Rachel-Bot
.\setup-windows.bat
```

#### Iniciar Bot no Windows:
```batch
.\start-windows.bat
# ou
npm start
```

> 💡 **Dica para Windows**: Use PowerShell como Administrador para evitar problemas de permissão!

### ⚙️ **Pré-requisitos**

- [Node.js](https://nodejs.org/) v16 ou superior
- [Git](https://git-scm.com/)
- Conta WhatsApp
- Conexão estável com internet

## 🎮 Comandos

### 🔧 **Utilitários Básicos**
| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `!ping` | Testar conexão e latência do bot | `!ping` |
| `!help` | Lista todos os comandos disponíveis | `!help` ou `!help ping` |
| `!info` | Informações detalhadas do bot | `!info` |
| `!status` | Status do sistema (somente admin) | `!status` |

### 🌟 **Comandos Temáticos da Rachel**
| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `!rachel` | Frases icônicas da Rachel | `!rachel` |
| `!torre` | Curiosidades sobre a Torre | `!torre` |
| `!estrelas` | Mensagens sobre as estrelas | `!estrelas` |
| `!subir` | Motivação para subir a Torre | `!subir` |

### 📱 **Mídia e Conversão**
| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `!sticker` | Criar figurinha de imagem/vídeo | Envie imagem + `!sticker` |
| `!toimg` | Converter sticker em imagem | Responda sticker + `!toimg` |

### 🛡️ **Administrativos (Grupos)**
| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `!kick` | Remover membro do grupo | `!kick @usuario` |
| `!promote` | Promover membro a admin | `!promote @usuario` |
| `!demote` | Rebaixar admin | `!demote @usuario` |
| `!mute` | Silenciar usuário temporariamente | `!mute @usuario 10m` |

> 💡 **Dica**: Use `!help [comando]` para ver detalhes específicos de cada comando!

## ⚙️ Configuração

### 📝 **Arquivo .env**

Copie `.env.example` para `.env` e configure:

```bash
# Informações Básicas
BOT_NAME=Rachel Bot
BOT_PREFIX=!
BOT_OWNER=Seu Nome Aqui

# Administração (seu número sem + e sem espaços)
ADMIN_NUMBERS=5511999999999

# Funcionalidades
AUTO_REPLY=true
SAVE_MESSAGES=true
LOG_LEVEL=info

# Mensagens Personalizadas
WELCOME_MESSAGE=🌟 Bem-vindo à Torre! Eu sou Rachel, sua guia nesta jornada.
HELP_MESSAGE=Como posso ajudá-lo a subir a Torre hoje?
```

### 🎨 **Personalização**

<details>
<summary><b>Como personalizar mensagens</b></summary>

Edite o arquivo `.env`:

```bash
# Mensagens temáticas
RACHEL_QUOTES=Frase 1|Frase 2|Frase 3|Frase 4
WELCOME_MESSAGE=Sua mensagem de boas-vindas
GOODBYE_MESSAGE=Sua mensagem de despedida

# Prefixo personalizado
BOT_PREFIX=.  # Pode usar . > / ou qualquer caractere
```

</details>

<details>
<summary><b>Como adicionar novos comandos</b></summary>

Crie arquivos na pasta `commands/`:

```javascript
// commands/exemplo.js
module.exports = {
    name: 'exemplo',
    description: 'Comando de exemplo',
    usage: '!exemplo [argumento]',
    category: 'Personalizado',
    cooldown: 5,
    execute: async (bot, message, args, from, sender) => {
        await bot.sendMessage(from, '🌟 Olá da Torre!');
    }
};
```

Pronto! O comando será carregado automaticamente.

</details>

## 📊 Monitoramento

### 📈 **Estatísticas em Tempo Real**
```bash
# Ver logs ao vivo
npm run logs

# Verificar status
!status  # No WhatsApp (admin only)
```

### 📋 **Informações Disponíveis:**
- ⏰ Tempo de atividade (uptime)
- 💬 Mensagens processadas
- ⚡ Comandos executados
- 💾 Uso de memória
- ❌ Erros registrados

## 🖼️ Screenshots

<details>
<summary><b>Clique para ver capturas de tela</b></summary>

### Banner de Inicialização
```
  ██████╗  █████╗  ██████╗██╗  ██╗███████╗██╗     
  ██╔══██╗██╔══██╗██╔════╝██║  ██║██╔════╝██║     
  ██████╔╝███████║██║     ███████║█████╗  ██║     
  ██╔══██╗██╔══██║██║     ██╔══██║██╔══╝  ██║     
  ██║  ██║██║  ██║╚██████╗██║  ██║███████╗███████╗
  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝
           🌟 Tower of God WhatsApp Bot 🌟
        "Eu só quero ver as estrelas..."
```

### Menu de Comandos no WhatsApp
```
🌟 RACHEL BOT - MENU DA TORRE 🌟

👋 Olá! Sou Rachel, sua guia na Torre.
🔧 Prefix: !
📊 Total de comandos: 12

📁 UTILITÁRIOS
!ping - Testar conexão do bot
!info - Informações do bot
!help - Lista de comandos disponíveis

🌟 RACHEL ESPECIAIS
!rachel - Frases da Rachel
!torre - Sobre a Torre
!estrelas - Mensagens sobre estrelas

💡 Dica: Use !help [comando] para detalhes
```

</details>

## 🛠️ Solução de Problemas

<details>
<summary><b>❓ QR Code não aparece</b></summary>

```bash
# Limpar sessão e reiniciar
rm -rf sessions/
npm start
```

</details>

<details>
<summary><b>❓ Bot não responde</b></summary>

```bash
# Verificar logs
npm run logs

# Verificar se o bot está online
!ping  # No WhatsApp

# Reiniciar
./start.sh  # Linux/Mac
.\start-windows.bat  # Windows
```

</details>

<details>
<summary><b>❓ Erro de dependências</b></summary>

```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

</details>

<details>
<summary><b>❓ Erros no Windows</b></summary>

Os erros do tipo:
```
[ERROR:components\services\storage\service_worker_storage.cc...]
```

São **normais** e podem ser ignorados! O bot funcionará perfeitamente.

Veja o guia completo: [SOLUÇÃO-WINDOWS.md](SOLUÇÃO-WINDOWS.md)

</details>

<details>
<summary><b>❓ Sem permissão (Linux/Mac)</b></summary>

```bash
# Dar permissões aos scripts
chmod +x start.sh install.sh
```

</details>

## 🚀 Deploy

### 🌐 **VPS/Servidor**
```bash
# Clonar e configurar
git clone https://github.com/Lightshzk/Rachel-Bot.git
cd Rachel-Bot
npm install
cp .env.example .env
# Editar .env
npm start
```

### 🐳 **Docker** (Em breve)
```bash
docker-compose up -d
```

### ☁️ **Hospedagem na Nuvem**
- Heroku
- Railway
- Render
- AWS EC2
- Google Cloud

> Tutoriais detalhados em breve na [Wiki](https://github.com/Lightshzk/Rachel-Bot/wiki)!

## 🤝 Contribuindo

Quer ajudar Rachel a subir a Torre? Todas as contribuições são bem-vindas! 💜

### 🎯 **Formas de contribuir:**
- 🐛 [Reportar bugs](https://github.com/Lightshzk/Rachel-Bot/issues)
- 💡 [Sugerir features](https://github.com/Lightshzk/Rachel-Bot/issues/new)
- 📝 Melhorar documentação
- 🔧 Contribuir com código
- ⭐ Dar uma estrela no projeto!

### 📋 **Para desenvolvedores:**
1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

Leia nosso [Guia de Contribuição](CONTRIBUTING.md) completo!

## 🗺️ Roadmap

- [x] ✅ Sistema básico de comandos
- [x] ✅ Interface temática da Rachel
- [x] ✅ Auto-reconexão
- [x] ✅ Sistema de logs
- [x] ✅ Suporte Windows completo
- [ ] 🔄 Comandos de música avançados
- [ ] 🔄 Sistema de economia/pontos
- [ ] 🔄 Mini-games da Torre
- [ ] 🔄 API REST para integrações
- [ ] 🔄 Dashboard web
- [ ] 🔄 Sistema de plugins
- [ ] 🔄 Suporte multi-idioma

## 📈 Estatísticas

![GitHub Activity](https://img.shields.io/github/commit-activity/m/Lightshzk/Rachel-Bot)
![GitHub Last Commit](https://img.shields.io/github/last-commit/Lightshzk/Rachel-Bot)
![GitHub Code Size](https://img.shields.io/github/languages/code-size/Lightshzk/Rachel-Bot)

## 🏆 Colaboradores

<a href="https://github.com/Lightshzk/Rachel-Bot/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Lightshzk/Rachel-Bot" />
</a>

## 💬 Suporte

### 📞 **Precisa de ajuda?**
- 🐛 [GitHub Issues](https://github.com/Lightshzk/Rachel-Bot/issues) - Reportar problemas
- 💭 [Discussions](https://github.com/Lightshzk/Rachel-Bot/discussions) - Dúvidas e ideias
- 📚 [Wiki](https://github.com/Lightshzk/Rachel-Bot/wiki) - Documentação detalhada
- 📧 Email: lightshzk@gmail.com

## 📄 Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE) - veja o arquivo LICENSE para detalhes.

## 🙏 Agradecimentos

- **SIU** - Criador do incrível manhwa Tower of God
- **WhiskeySockets** - Pela biblioteca [Baileys](https://github.com/WhiskeySockets/Baileys)
- **Comunidade Tower of God** - Pela inspiração e feedback
- **Todos os contribuidores** - Por tornarem este projeto melhor

## ⭐ Apoie o Projeto

Se este projeto te ajudou, considere:
- ⭐ Dar uma estrela no repositório
- 🐦 Compartilhar com amigos fãs de Tower of God
- 🤝 Contribuir com código ou documentação
- 💜 Seguir no GitHub para updates

---

<div align="center">

### _"As estrelas nos esperam no topo da Torre!"_ ⭐

**Feito com 💜 por [Lightshzk](https://github.com/Lightshzk)**

[![GitHub](https://img.shields.io/badge/GitHub-Lightshzk-black?style=for-the-badge&logo=github)](https://github.com/Lightshzk)
[![Rachel Bot](https://img.shields.io/badge/Rachel%20Bot-v1.0.0-purple?style=for-the-badge&logo=whatsapp)](https://github.com/Lightshzk/Rachel-Bot)

**🌟 Se este projeto te ajudou, dê uma estrela! 🌟**

</div>
