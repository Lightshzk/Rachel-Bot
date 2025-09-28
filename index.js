// ==========================================
// 🌟 INDEX - RACHEL BOT 🌟
// Foco na Rachel de Tower of God
// ==========================================

const client = require('./conexao'); // importa o cliente do seu conexao.js
const { MessageMedia } = require('whatsapp-web.js');

// Quando o bot estiver pronto
client.on('ready', () => {
    console.log('Rachel está online... 🌙');
});

// Recebendo mensagens
client.on('message', async (message) => {
    const text = message.body.toLowerCase();

    // Comando: /rachel
    if (text === '/rachel') {
        return message.reply("...Você realmente quer saber o que eu penso? 😏");
    }

    // Comando: /secret
    if (text === '/secret') {
        return message.reply("Segredos são perigosos. Mas eu posso compartilhar... 🌌");
    }

    // Comando: /sticker - transforma imagem enviada em sticker
    if (text.startsWith('/sticker')) {
        try {
            const mediaMessage = await message.downloadMedia();
            if (!mediaMessage) return message.reply("Envie uma imagem junto com o comando para virar sticker!");
            
            const sticker = new MessageMedia(mediaMessage.mimetype, mediaMessage.data, mediaMessage.filename);
            await client.sendMessage(message.from, sticker, { sendMediaAsSticker: true });
        } catch (err) {
            console.error(err);
            return message.reply("❌ Erro ao criar o sticker...");
        }
    }
     else if (command === 'anime') {
          const nome = args.join(' ');
          if (!nome) return await message.reply('❗ Use: anime <nome do anime>');
          try {
            const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(nome)}&limit=1`);
            const anime = res.data.data[0];
            if (!anime) return await message.reply('❌ Anime não encontrado.');
            const imgBase64 = await downloadImageToBase64(anime.images.jpg.image_url);
            if (!imgBase64) throw new Error('Falha ao baixar imagem');
            const legenda = `🎌 *${anime.title}* (${anime.type})\n\n📖 ${anime.synopsis?.slice(0, 500) || 'Sem descrição'}\n\n🔗 *Link:* ${anime.url}`;
            const media = new MessageMedia('image/jpeg', imgBase64.split(',')[1]);
            return await client.sendMessage(userId, media, { caption: legenda });
          } catch (err) {
            console.error('Erro anime:', err);
            return await message.reply('❌ Erro ao buscar informações do anime.');
          }
        }

    // Mensagens relacionadas à Torre
    if (text.includes('baam') || text.includes('tower')) {
        return message.reply("Ah... você fala da Torre? Cuidado com o que deseja... 🌌");
    }
});
