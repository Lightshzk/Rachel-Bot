# 🌟 Rachel Bot - Tower of God

<div align="center">

<img src="https://i.imgur.com/your-rachel-image.png" alt="Rachel Bot" width="200"/>

![GitHub stars](https://img.shields.io/github/stars/Lightshzk/Rachel-Bot?style=for-the-badge&color=purple)
![GitHub forks](https://img.shields.io/github/forks/Lightshzk/Rachel-Bot?style=for-the-badge&color=blue)
![GitHub issues](https://img.shields.io/github/issues/Lightshzk/Rachel-Bot?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-16%2B-green?style=for-the-badge&logo=node.js)
![WhatsApp](https://img.shields.io/badge/WhatsApp-Bot-25D366?style=for-the-badge&logo=whatsapp)
![License](https://img.shields.io/github/license/Lightshzk/Rachel-Bot?style=for-the-badge)

### _"Eu só quero ver as estrelas..."_ ✨

**Bot completo para WhatsApp inspirado na Rachel de Tower of God (Kami no Tou)**

[📥 Instalação](#-instalação-rápida) •
[📋 Comandos](#-comandos-disponíveis) •
[⚙️ Configuração](#️-configuração) •
[🤝 Contribuir](#-como-contribuir) •
[💬 Suporte](#-suporte)

---

</div>

## 🎯 Sobre o Projeto

Rachel Bot é um bot avançado para WhatsApp que traz a magia de **Tower of God** para suas conversas! Inspirado na icônica personagem Rachel, o bot oferece uma experiência única com tema completo do manhwa, funcionalidades robustas e uma interface que faz você se sentir subindo a Torre.

### ⭐ Por que escolher Rachel Bot?

- 🌟 **100% Temático**: Design e mensagens inspiradas em Tower of God
- 🚀 **Fácil de usar**: Instalação automática em um comando
- 🛡️ **Seguro**: Não salva suas mensagens, totalmente privado
- 🔧 **Personalizável**: Adicione seus próprios comandos facilmente
- 📱 **Multi-plataforma**: Funciona em Linux, macOS e Windows
- 🆓 **Gratuito**: 100% open source, sem custos ocultos

## ✨ Principais Recursos

<table>
<tr>
<td>

### 🎮 **Comandos Inteligentes**
- Sistema de prefixo personalizável
- Cooldown automático
- Suporte a aliases
- Help contextual

</td>
<td>

### 👑 **Sistema Admin**
- Controles administrativos
- Comandos exclusivos
- Gerenciamento de grupos
- Logs detalhados

</td>
</tr>
<tr>
<td>

### 🌐 **Multi-sessão**
- Múltiplas contas simultâneas
- Reconexão automática
- QR Code personalizado
- Sessões seguras

</td>
<td>

### 🎨 **Experiência Temática**
- Interface da Rachel
- Frases do manhwa
- Cores temáticas
- Emojis personalizados

</td>
</tr>
</table>

## 📥 Instalação Rápida

### 🚀 **Instalação Automática (Recomendado)**

```bash
curl -fsSL https://raw.githubusercontent.com/Lightshzk/Rachel-Bot/main/install.sh | bash
```

### 📋 **Instalação Manual**

<details>
<summary>Clique para expandir</summary>

#### Pré-requisitos
- Node.js 16+ ([baixar aqui](https://nodejs.org/))
- Git ([baixar aqui](https://git-scm.com/))

#### Passo a passo
```bash
# 1. Clonar repositório
git clone https://github.com/Lightshzk/Rachel-Bot.git
cd Rachel-Bot

# 2. Instalar dependências
npm install

# 3. Configurar ambiente
cp .env.example .env
nano .env  # Configure suas variáveis

# 4. Dar permissões
chmod +x start.sh

# 5. Iniciar bot
./start.sh
```

</details>

### 🐳 **Docker (Em breve)**

```bash
docker run -d --name rachel-bot lightshzk/rachel-bot
```

## 🎮 Comandos Disponíveis

### 🔧 **Utilitários Básicos**
| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `!ping` | Testar conexão e latência | `!ping` |
| `!help` | Lista todos os comandos | `!help` ou `!help ping` |
| `!info` | Informações do bot | `!info` |
| `!status` | Status detalhado (admin) | `!status` |

### 🌟 **Comandos Temáticos da Rachel**
| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `!rachel` | Frases icônicas da Rachel | `!rachel` |
| `!torre` | Curiosidades sobre a Torre | `!torre` |
| `!estrelas` | Mensagens sobre as estrelas | `!estrelas` |
| `!subir` | Motivação para subir a Torre | `!subir` |

### 📱 **Mídia e Utilitários**
| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `!sticker` | Criar figurinha | Envie imagem + `!sticker` |
| `!toimg` | Sticker para imagem | Responda sticker + `!toimg` |
| `!clima` | Previsão do tempo | `!clima São Paulo` |

### 🛡️ **Administrativos (Grupos)**
| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `!kick` | Remover membro | `!kick @usuario` |
| `!promote` | Promover a admin | `!promote @usuario` |
| `!demote` | Rebaixar admin | `!demote @usuario` |
| `!mute` | Silenciar usuário | `!mute @usuario 10m` |

> 💡 **Dica**: Use `!help [comando]` para ver detalhes específicos de cada comando!

## ⚙️ Configuração

### 📝 **Arquivo .env**

```bash
# Informações básicas
BOT_NAME=Rachel Bot
BOT_PREFIX=!
BOT_OWNER=Seu Nome

# Administração (seu número sem +)
ADMIN_NUMBERS=5511999999999

# Funcionalidades
AUTO_REPLY=true
WELCOME_MESSAGE=🌟 Bem-vindo à Torre! Use !help para começar.
```

### 🎨 **Personalização**

<details>
<summary>Como personalizar mensagens</summary>

Edite o arquivo `.env` para personalizar:

```bash
# Mensagens personalizadas
WELCOME_MESSAGE=Sua mensagem de boas-vindas
HELP_MESSAGE=Sua mensagem de ajuda
RACHEL_QUOTES=Frase1|Frase2|Frase3

# Prefixos alternativos
BOT_PREFIX=.  # ou > ou qualquer caractere
```

</details>

<details>
<summary>Como adicionar comandos</summary>

Crie arquivos na pasta `commands/`:

```javascript
// commands/exemplo.js
module.exports = {
    name: 'exemplo',
    description: 'Comando de exemplo',
    usage: '!exemplo [arg]',
    category: 'Personalizado',
    execute: async (bot, message, args, from, sender) => {
        await bot.sendMessage(from, 'Olá da Torre!');
    }
};
```

</details>

## 📊 Dashboard e Monitoramento

### 📈 **Estatísticas em Tempo Real**
- Mensagens processadas
- Comandos executados
- Tempo de atividade
- Uso de memória

### 📋 **Logs Detalhados**
```bash
# Ver logs em tempo real
npm run logs

# Logs por data
cat logs/2024-01-15.log
```

## 🖼️ Screenshots

<details>
<summary>Clique para ver capturas de tela</summary>

### Inicialização
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

### Menu de Comandos
<img src="https://i.imgur.com/menu-example.png" alt="Menu" width="400"/>

### Chat Exemplo
<img src="https://i.imgur.com/chat-example.png" alt="Chat" width="400"/>

</details>

## 🔧 Scripts e Ferramentas

```bash
# Comandos disponíveis
npm start              # Iniciar bot
npm run dev            # Modo desenvolvimento
npm run logs           # Ver logs
npm test               # Executar testes
./start.sh             # Interface Rachel
./install.sh           # Instalador
```

## 🚀 Deploy

### 🌐 **VPS/Servidor**
```bash
# Clonar e configurar
git clone https://github.com/Lightshzk/Rachel-Bot.git
cd Rachel-Bot
npm install
cp .env.example .env
# Configurar .env
npm start
```

### ☁️ **Heroku**
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Lightshzk/Rachel-Bot)

### 🐳 **Docker** (Em breve)
```bash
docker-compose up -d
```

## 🛠️ Solução de Problemas

<details>
<summary>❓ Problemas Comuns</summary>

### QR Code não aparece
```bash
rm -rf sessions/
npm start
```

### Bot não responde
```bash
# Verificar logs
npm run logs
# Reiniciar
./start.sh
```

### Erro de dependências
```bash
rm -rf node_modules package-lock.json
npm install
```

### Sem permissão nos scripts
```bash
chmod +x start.sh install.sh
```

</details>

<details>
<summary>🐛 Reportar Bugs</summary>

Encontrou um bug? [Abra uma issue](https://github.com/Lightshzk/Rachel-Bot/issues/new) com:

- Descrição do problema
- Passos para reproduzir
- Logs de erro
- Sistema operacional
- Versão do Node.js

</details>

## 🤝 Como Contribuir

Quer ajudar Rachel a subir a Torre? Todas as contribuições são bem-vindas! 

### 🎯 **Formas de contribuir:**
- 🐛 Reportar bugs
- 💡 Sugerir features
- 📝 Melhorar documentação
- 🔧 Contribuir com código
- ⭐ Dar uma estrela no projeto!

### 📋 **Para desenvolvedores:**
1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

Leia nosso [Guia de Contribuição](CONTRIBUTING.md) para mais detalhes!

## 🏆 Colaboradores

<a href="https://github.com/Lightshzk/Rachel-Bot/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Lightshzk/Rachel-Bot" />
</a>

## 📈 Estatísticas do Projeto

![GitHub Activity](https://img.shields.io/github/commit-activity/m/Lightshzk/Rachel-Bot)
![GitHub last commit](https://img.shields.io/github/last-commit/Lightshzk/Rachel-Bot)
![GitHub code size](https://img.shields.io/github/languages/code-size/Lightshzk/Rachel-Bot)

## 🗺️ Roadmap

- [x] ✅ Sistema básico de comandos
- [x] ✅ Interface temática da Rachel
- [x] ✅ Auto-reconexão
- [x] ✅ Sistema de logs
- [ ] 🔄 Comandos de música avançados
- [ ] 🔄 Sistema de economia/pontos
- [ ] 🔄 Mini-games da Torre
- [ ] 🔄 API para integrações
- [ ] 🔄 Dashboard web
- [ ] 🔄 Sistema de plugins

## 💬 Suporte

### 📞 **Canais de Suporte:**
- 🐛 **GitHub Issues**: [Reportar problemas](https://github.com/Lightshzk/Rachel-Bot/issues)
- 💬 **Discord**: [Servidor da comunidade](#) (Em breve)
- 📧 **Email**: lightshzk@gmail.com
- 🐦 **Twitter**: [@Lightshzk](#) (Em breve)

### 🌟 **Comunidade:**
- [📚 Wiki](https://github.com/Lightshzk/Rachel-Bot/wiki) - Tutoriais e guias
- [💭 Discussions](https://github.com/Lightshzk/Rachel-Bot/discussions) - Dúvidas e ideias
- [🎮 Exemplos](https://github.com/Lightshzk/Rachel-Bot/tree/examples) - Casos de uso

## 📄 Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE) - veja o arquivo LICENSE para detalhes.

## 🙏 Agradecimentos

- **SIU** - Criador do incrível manhwa Tower of God
- **WhiskeySockets** - Biblioteca Baileys que torna tudo possível
- **Comunidade Tower of God** - Inspiração e feedback constantes
- **Contribuidores** - Todos que ajudam a melhorar o projeto

## ⭐ Se você gostou

Se este projeto te ajudou, considere:
- ⭐ Dar uma estrela no repositório
- 🐦 Compartilhar com amigos
- 🤝 Contribuir com o projeto
- ☕ [Comprar um café para o dev](#) (Em breve)

---

<div align="center">

### _"As estrelas nos esperam no topo da Torre!"_ ⭐

**Feito com 💜 por [Lightshzk](https://github.com/Lightshzk)**

[![GitHub](https://img.shields.io/badge/GitHub-Lightshzk-black?style=for-the-badge&logo=github)](https://github.com/Lightshzk)
[![Rachel Bot](https://img.shields.io/badge/Rachel%20Bot-v1.0.0-purple?style=for-the-badge&logo=whatsapp)](https://github.com/Lightshzk/Rachel-Bot)

### 🌟 Dê uma estrela se este projeto te ajudou! 🌟

</div>
