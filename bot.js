const { Client, LocalAuth } = require('whatsapp-web.js');
const play = require('play-dl');
const yts = require('yt-search');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// ============================================
// VARIÁVEIS E CAMINHOS DOS ARQUIVOS
// ============================================
const vidaPath = './torreVida.json';
const moneyPath = './torreMoney.json';
const inventarioPath = './torreInventario.json';
const xpPath = './torreXP.json';
const dailyPath = './torreDaily.json';
const casamentoPath = './torreCasamento.json';
const trocasPath = './torreTrocas.json';
const forcaGames = new Map();

const cooldowns = {};
const forcaAtiva = {};
const batalhasAtivas = {};

let torreDaily = {};
let torreCasamento = {};
let torreTrocas = {};
let torreVida = {};
let torreMoney = {};
let torreInventario = {};
let torreXP = {};

// CARREGAR DADOS
if (fs.existsSync(dailyPath)) torreDaily = JSON.parse(fs.readFileSync(dailyPath));
if (fs.existsSync(casamentoPath)) torreCasamento = JSON.parse(fs.readFileSync(casamentoPath));
if (fs.existsSync(trocasPath)) torreTrocas = JSON.parse(fs.readFileSync(trocasPath));
if (fs.existsSync(vidaPath)) torreVida = JSON.parse(fs.readFileSync(vidaPath));
if (fs.existsSync(moneyPath)) torreMoney = JSON.parse(fs.readFileSync(moneyPath));
if (fs.existsSync(inventarioPath)) torreInventario = JSON.parse(fs.readFileSync(inventarioPath));
if (fs.existsSync(xpPath)) torreXP = JSON.parse(fs.readFileSync(xpPath));

// ============================================
// FUNÇÕES PARA SALVAR DADOS
// ============================================
function salvarVida() { fs.writeFileSync(vidaPath, JSON.stringify(torreVida, null, 2)); }
function salvarMoney() { fs.writeFileSync(moneyPath, JSON.stringify(torreMoney, null, 2)); }
function salvarInventario() { fs.writeFileSync(inventarioPath, JSON.stringify(torreInventario, null, 2)); }
function salvarXP() { fs.writeFileSync(xpPath, JSON.stringify(torreXP, null, 2)); }
function salvarDaily() { fs.writeFileSync(dailyPath, JSON.stringify(torreDaily, null, 2)); }
function salvarCasamento() { fs.writeFileSync(casamentoPath, JSON.stringify(torreCasamento, null, 2)); }
function salvarTrocas() { fs.writeFileSync(trocasPath, JSON.stringify(torreTrocas, null, 2)); }

console.log('🚀 Iniciando bot da Rachel...');

// ============================================
// SISTEMA DE XP E NÍVEIS
// ============================================
function inicializarJogador(userId) {
    if (!torreXP[userId]) {
        torreXP[userId] = { xp: 0, nivel: 1, xpProximoNivel: 100 };
        salvarXP();
    }
    if (torreVida[userId] === undefined) {
        torreVida[userId] = 100;
        salvarVida();
    }
    if (!torreMoney[userId]) {
        torreMoney[userId] = 0;
        salvarMoney();
    }
}

function adicionarXP(userId, quantidade) {
    inicializarJogador(userId);
    torreXP[userId].xp += quantidade;
    let mensagem = `\n✨ +${quantidade} XP`;
    
    while (torreXP[userId].xp >= torreXP[userId].xpProximoNivel) {
        torreXP[userId].xp -= torreXP[userId].xpProximoNivel;
        torreXP[userId].nivel++;
        torreXP[userId].xpProximoNivel = Math.floor(100 * Math.pow(1.5, torreXP[userId].nivel - 1));
        
        const recompensaMoedas = torreXP[userId].nivel * 50;
        torreMoney[userId] = (torreMoney[userId] || 0) + recompensaMoedas;
        torreVida[userId] = 100;
        
        mensagem += `\n\n🎉 *LEVEL UP!* 🎉\n⬆️ Nível ${torreXP[userId].nivel}\n💰 +${recompensaMoedas} moedas\n❤️ Vida restaurada!`;
    }
    
    salvarXP();
    salvarMoney();
    salvarVida();
    return mensagem;
}

function calcularPoder(userId) {
    inicializarJogador(userId);
    const nivel = torreXP[userId].nivel;
    const vida = torreVida[userId] || 100;
    return Math.floor((nivel * 10) + (vida * 0.5));
}

// ============================================
// SISTEMA DE COOLDOWN
// ============================================
function verificarCooldown(userId, comando, tempoSegundos) {
    const agora = Date.now();
    const cooldownKey = `${userId}_${comando}`;
    
    if (cooldowns[cooldownKey] && (agora - cooldowns[cooldownKey]) < tempoSegundos * 1000) {
        const tempoRestante = Math.ceil((tempoSegundos * 1000 - (agora - cooldowns[cooldownKey])) / 1000);
        return { emCooldown: true, tempoRestante };
    }
    
    cooldowns[cooldownKey] = agora;
    return { emCooldown: false };
}

const palavrasForca = [
    { palavra: "bam", dica: "Protagonista da Torre" },
    { palavra: "rachel", dica: "Quer ver as estrelas" },
    { palavra: "khun", dica: "Estrategista genial" },
    { palavra: "rak", dica: "Guerreiro jacaré" },
    { palavra: "endorsi", dica: "Princesa da Zahard" },
    { palavra: "yuri", dica: "Princesa de cabelo vermelho" },
    { palavra: "shinsu", dica: "Energia da Torre" },
    { palavra: "irregular", dica: "Quem abre as portas" },
    { palavra: "ranker", dica: "Completou a Torre" },
    { palavra: "guardian", dica: "Protetor de andar" },
    { palavra: "zahard", dica: "Rei da Torre" },
    { palavra: "hwaryun", dica: "Guia de olhos vermelhos" },
    { palavra: "karaka", dica: "Membro da FUG" },
    { palavra: "wangnan", dica: "Príncipe do anel" },
    { palavra: "hoaqin", dica: "Matador branco" }
];

function desenharForca(tentativas) {
    const estagios = [
        // 0 tentativas (morto)
        `   ╔═══╗
   ║   ☠️
   ║  /|\\
   ║   |
   ║  / \\
  ═╩═══`,
        // 1 tentativa
        `   ╔═══╗
   ║   😵
   ║  /|\\
   ║   |
   ║  / 
  ═╩═══`,
        // 2 tentativas
        `   ╔═══╗
   ║   😰
   ║  /|\\
   ║   |
   ║   
  ═╩═══`,
        // 3 tentativas
        `   ╔═══╗
   ║   😨
   ║  /|
   ║   |
   ║   
  ═╩═══`,
        // 4 tentativas
        `   ╔═══╗
   ║   😟
   ║   |
   ║   |
   ║   
  ═╩═══`,
        // 5 tentativas
        `   ╔═══╗
   ║   😐
   ║   
   ║   
   ║   
  ═╩═══`,
        // 6 tentativas (início)
        `   ╔═══╗
   ║   
   ║   
   ║   
   ║   
  ═╩═══`
    ];
    
    return estagios[tentativas] || estagios[0];
}

// ============================================
// SISTEMA DE BATALHA PVP
// ============================================
function iniciarBatalha(desafiante, oponente) {
    inicializarJogador(desafiante);
    inicializarJogador(oponente);
    
    const batalhaId = `${desafiante}_${oponente}`;
    
    batalhasAtivas[batalhaId] = {
        desafiante: {
            id: desafiante,
            vida: torreVida[desafiante] || 100,
            poder: calcularPoder(desafiante)
        },
        oponente: {
            id: oponente,
            vida: torreVida[oponente] || 100,
            poder: calcularPoder(oponente)
        },
        turno: desafiante,
        timestamp: Date.now()
    };
    
    return batalhaId;
}

function atacarBatalha(batalhaId, atacanteId) {
    const batalha = batalhasAtivas[batalhaId];
    if (!batalha) return { erro: 'Batalha não encontrada!' };
    
    if (batalha.turno !== atacanteId) {
        return { erro: 'Não é seu turno!' };
    }
    
    const atacante = batalha.desafiante.id === atacanteId ? batalha.desafiante : batalha.oponente;
    const defensor = batalha.desafiante.id === atacanteId ? batalha.oponente : batalha.desafiante;
    
    const danoBase = atacante.poder;
    const variacao = Math.floor(Math.random() * 20) - 10;
    const dano = Math.max(10, danoBase + variacao);
    
    defensor.vida -= dano;
    
    let resultado = {
        dano: dano,
        vidaDefensor: Math.max(0, defensor.vida),
        atacante: atacanteId,
        defensor: defensor.id
    };
    
    if (defensor.vida <= 0) {
        const recompensa = Math.floor(50 * (1 + (torreXP[defensor.id]?.nivel || 1) * 0.5));
        torreMoney[atacante.id] = (torreMoney[atacante.id] || 0) + recompensa;
        
        torreVida[defensor.id] = Math.max(0, torreVida[defensor.id] - 30);
        
        salvarMoney();
        salvarVida();
        
        resultado.vencedor = atacante.id;
        resultado.recompensa = recompensa;
        resultado.xp = adicionarXP(atacante.id, 80);
        
        delete batalhasAtivas[batalhaId];
    } else {
        batalha.turno = defensor.id;
    }
    
    return resultado;
}

// ============================================
// FUNÇÃO PARA VERIFICAR ADMIN
// ============================================
async function isAdmin(message) {
    if (!message.from.includes('@g.us')) return false;
    
    try {
        const chat = await message.getChat();
        const admins = chat.participants
            .filter(p => p.isAdmin)
            .map(a => a.id._serialized);
        
        const senderId = message.from;
        return admins.includes(senderId);
    } catch (error) {
        console.error('Erro ao verificar admin:', error);
        return false;
    }
}

// ============================================
// PERSONALIDADE RACHEL
// ============================================
const rachelPersonality = {
    greetings: ["Olá... o que você quer?", "Ah, é você. O que precisa?", "Subir a Torre não é fácil, sabia?"],
    aboutHer: ["Eu só quero ver as estrelas... é tudo que sempre quis.", "Bam nunca entendeu. Ele tinha tudo, eu não tinha nada.", "Farei o que for preciso para subir a Torre.", "As pessoas me chamam de traidora, mas elas não entendem o meu sonho."],
    aboutBam: ["Bam... ele é complicado de explicar.", "Ele nunca deveria ter entrado na Torre. Era MEU sonho, não dele.", "Por que ele me seguiu? Eu nunca pedi isso."],
    aboutTower: ["A Torre é cruel, mas é o único caminho para o meu sonho.", "Cada andar é um desafio, mas eu vou conseguir.", "No topo da Torre, finalmente verei as estrelas."],
    manipulation: ["Às vezes, precisamos fazer escolhas difíceis para sobreviver.", "Na Torre, você usa ou é usado. É simples assim.", "Não sou má, só sou... realista."],
    farewell: ["Tchau. Tenho coisas mais importantes para fazer.", "Até mais. A Torre não espera por ninguém.", "Bye... continue sonhando pequeno se quiser."]
};

function getRandomResponse(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// ============================================
// SISTEMA DE RANKING
// ============================================
function getTopRanking(tipo, limite = 10) {
    let rankings = [];
    
    if (tipo === 'nivel') {
        for (let userId in torreXP) {
            rankings.push({
                userId: userId,
                valor: torreXP[userId].nivel,
                xp: torreXP[userId].xp
            });
        }
        rankings.sort((a, b) => b.valor === a.valor ? b.xp - a.xp : b.valor - a.valor);
    } 
    else if (tipo === 'moedas') {
        for (let userId in torreMoney) {
            rankings.push({ userId: userId, valor: torreMoney[userId] });
        }
        rankings.sort((a, b) => b.valor - a.valor);
    }
    else if (tipo === 'poder') {
        for (let userId in torreXP) {
            rankings.push({ userId: userId, valor: calcularPoder(userId) });
        }
        rankings.sort((a, b) => b.valor - a.valor);
    }
    
    return rankings.slice(0, limite);
}

function getMedalha(posicao) {
    if (posicao === 1) return '🥇';
    if (posicao === 2) return '🥈';
    if (posicao === 3) return '🥉';
    return `${posicao}º`;
}

// ============================================
// SISTEMA DE DAILY REWARDS
// ============================================
function verificarDaily(userId) {
    const hoje = new Date().toDateString();
    
    if (!torreDaily[userId]) {
        torreDaily[userId] = { ultimoDaily: null, streak: 0 };
    }
    
    const ultimoDaily = torreDaily[userId].ultimoDaily;
    
    if (ultimoDaily === hoje) {
        return { disponivel: false, mensagem: 'Você já coletou sua recompensa diária hoje!' };
    }
    
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const ontemString = ontem.toDateString();
    
    if (ultimoDaily === ontemString) {
        torreDaily[userId].streak++;
    } else if (ultimoDaily !== null) {
        torreDaily[userId].streak = 1;
    } else {
        torreDaily[userId].streak = 1;
    }
    
    const streak = torreDaily[userId].streak;
    const moedas = 50 + (streak * 10);
    const xp = 25 + (streak * 5);
    
    let bonus = '';
    if (streak % 7 === 0) {
        bonus = '\n🎁 BÔNUS SEMANAL: +200 moedas!';
        torreMoney[userId] = (torreMoney[userId] || 0) + 200;
    }
    
    torreMoney[userId] = (torreMoney[userId] || 0) + moedas;
    const xpMsg = adicionarXP(userId, xp);
    
    torreDaily[userId].ultimoDaily = hoje;
    salvarDaily();
    salvarMoney();
    
    return { disponivel: true, streak, moedas, xp, xpMsg, bonus };
}

// ============================================
// MINI-GAMES
// ============================================
function jogarCaraCoroa(escolha) {
    const resultado = Math.random() < 0.5 ? 'cara' : 'coroa';
    return { resultado, ganhou: escolha === resultado };
}

function rolarDado() {
    return Math.floor(Math.random() * 6) + 1;
}

function jogarSlot() {
    const simbolos = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣'];
    const resultado = [
        simbolos[Math.floor(Math.random() * simbolos.length)],
        simbolos[Math.floor(Math.random() * simbolos.length)],
        simbolos[Math.floor(Math.random() * simbolos.length)]
    ];
    
    let multiplicador = 0;
    
    if (resultado[0] === resultado[1] && resultado[1] === resultado[2]) {
        if (resultado[0] === '7️⃣') multiplicador = 10;
        else if (resultado[0] === '💎') multiplicador = 7;
        else multiplicador = 5;
    }
    else if (resultado[0] === resultado[1] || resultado[1] === resultado[2]) {
        multiplicador = 2;
    }
    
    return { resultado, multiplicador };
}

// ============================================
// SISTEMA DE CASAMENTO
// ============================================
function verificarCasado(userId) {
    for (let casal in torreCasamento) {
        const [pessoa1, pessoa2] = casal.split('_');
        if (pessoa1 === userId || pessoa2 === userId) {
            return {
                casado: true,
                parceiro: pessoa1 === userId ? pessoa2 : pessoa1,
                casal: casal
            };
        }
    }
    return { casado: false };
}

function criarCasamento(userId1, userId2) {
    const casalId = `${userId1}_${userId2}`;
    torreCasamento[casalId] = {
        data: new Date().toISOString(),
        xpCompartilhado: 0
    };
    salvarCasamento();
    return casalId;
}

// ============================================
// SISTEMA DE PROPOSTAS DE CASAMENTO
// ============================================
const propostaCasamento = {};

function criarPropostaMatrimonio(userId, parceiro) {
    propostaCasamento[parceiro] = {
        de: userId,
        para: parceiro,
        timestamp: Date.now()
    };
    return true;
}

function verificarPropostaCasamento(userId) {
    return propostaCasamento[userId] || null;
}

function deletarPropostaCasamento(userId) {
    delete propostaCasamento[userId];
}

// ============================================
// SISTEMA DE TROCAS
// ============================================
function criarProposta(remetente, destinatario, itemOferecido, itemPedido) {
    const trocaId = `${remetente}_${Date.now()}`;
    torreTrocas[trocaId] = {
        remetente,
        destinatario,
        itemOferecido,
        itemPedido,
        status: 'pendente',
        timestamp: Date.now()
    };
    salvarTrocas();
    return trocaId;
}

function aceitarTroca(trocaId) {
    const troca = torreTrocas[trocaId];
    if (!troca || troca.status !== 'pendente') {
        return { erro: 'Troca não encontrada ou já processada!' };
    }
    
    const invRemetente = torreInventario[troca.remetente] || [];
    const invDestinatario = torreInventario[troca.destinatario] || [];
    
    const idxOferecido = invRemetente.indexOf(troca.itemOferecido);
    const idxPedido = invDestinatario.indexOf(troca.itemPedido);
    
    if (idxOferecido === -1) {
        return { erro: 'O remetente não possui mais o item oferecido!' };
    }
    if (idxPedido === -1) {
        return { erro: 'Você não possui mais o item pedido!' };
    }
    
    invRemetente.splice(idxOferecido, 1);
    invDestinatario.splice(idxPedido, 1);
    
    invRemetente.push(troca.itemPedido);
    invDestinatario.push(troca.itemOferecido);
    
    torreInventario[troca.remetente] = invRemetente;
    torreInventario[troca.destinatario] = invDestinatario;
    
    troca.status = 'aceita';
    
    salvarInventario();
    salvarTrocas();
    
    return { sucesso: true };
}

// ============================================
// RESPOSTAS RACHEL
// ============================================
const rachelRespostas = {
    "amor": ["Amor? Isso é uma fraqueza na Torre.", "Bam falava de amor... eu só queria ver as estrelas.", "Amor não me levará ao topo da Torre."],
    "sonho": ["Meu sonho é ver as estrelas, e farei qualquer coisa por isso.", "Todos têm sonhos, mas poucos têm coragem de persegui-los.", "Na Torre, sonhos se tornam obsessões."],
    "amizade": ["Amizade? Na Torre, só existem aliados temporários.", "Khun entende isso melhor que ninguém.", "Amigos são úteis... até certo ponto."],
    "traicao": ["Traição é uma palavra forte. Eu apenas fiz o necessário.", "Na Torre, ou você trai ou é traído.", "Não me arrependo do que fiz."],
    "bam": ["Bam... ele não deveria ter me seguido.", "Por que ele insiste em subir a Torre? Não é o sonho dele.", "Ele tinha tudo, eu não tinha nada."],
    "torre": ["A Torre é cruel, mas justa. Ela recompensa os fortes.", "Cada andar é um teste. E eu vou passar em todos.", "No topo da Torre, finalmente serei livre."],
    "estrelas": ["As estrelas... eu só quero vê-las uma vez.", "Você entenderia se também vivesse na escuridão.", "As estrelas são minha única razão de existir."],
    "medo": ["Medo? Sim, tenho medo de nunca ver as estrelas.", "Na Torre, o medo te mantém vivo.", "Não tenho medo de fazer o que é necessário."],
    "poder": ["Poder é o único que importa aqui.", "Sem poder, você é apenas mais um Regular.", "Vou conseguir o poder necessário para subir."]
};

function rachelResponder(pergunta) {
    pergunta = pergunta.toLowerCase();
    
    for (let palavra in rachelRespostas) {
        if (pergunta.includes(palavra)) {
            return rachelRespostas[palavra][Math.floor(Math.random() * rachelRespostas[palavra].length)];
        }
    }
    
    const respostasGenericas = ["Interessante pergunta... mas não vou responder.", "Por que você quer saber isso?", "Isso não importa para subir a Torre.", "Você fala demais.", "...", "Não tenho tempo para isso."];
    return respostasGenericas[Math.floor(Math.random() * respostasGenericas.length)];
}

function rachelConselho() {
    const conselhos = [
        "Nunca confie em ninguém completamente. Na Torre, todos têm seus próprios objetivos.",
        "Se você quer algo, vá buscar. Não espere que alguém te dê.",
        "Às vezes, sacrifícios são necessários para alcançar seus sonhos.",
        "A Torre não perdoa os fracos. Fique forte ou desista.",
        "Não deixe suas emoções controlarem suas decisões.",
        "Todo mundo mente na Torre. Aprenda a identificar.",
        "Poder é mais importante que moral aqui.",
        "Aliados são úteis, mas não essenciais.",
        "Foque no seu objetivo. Distrações são perigosas.",
        "Na Torre, ou você sobe ou cai. Não existe meio termo."
    ];
    return conselhos[Math.floor(Math.random() * conselhos.length)];
}

// ============================================
// INICIALIZAR CLIENTE WHATSAPP
// ============================================
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: '.wwebjs_auth' }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

client.on('loading_screen', (percent, message) => {
    console.log(`⏳ Carregando: ${percent}% - ${message}`);
});

client.on('qr', (qr) => {
    console.log('\n📱 ESCANEIE O QR CODE ABAIXO COM SEU WHATSAPP:\n');
    qrcode.generate(qr, { small: true });
    console.log('\n⚠️  Abra o WhatsApp > Aparelhos Conectados > Conectar aparelho\n');
});

client.on('authenticated', () => {
    console.log('✅ Autenticação bem-sucedida!');
});

client.on('ready', () => {
    console.log('\n' + '='.repeat(50));
    console.log('✅ BOT DA RACHEL ESTÁ ONLINE E FUNCIONANDO!');
    console.log('🌟 "Eu vou ver as estrelas..."');
    console.log('='.repeat(50) + '\n');
    console.log('👂 Aguardando mensagens...\n');
});

// ============================================
// PROCESSAR MENSAGENS
// ============================================
client.on('message_create', async (message) => {
    try {
        if (!message.body) return;

        const msg = message.body.toLowerCase().trim();
        const userId = message.author || message.from;

        console.log('\n' + '-'.repeat(50));
        console.log(`📨 MENSAGEM: "${message.body}"`);
        console.log(`De: ${message.from}`);
        console.log(`Autor: ${userId}`);
        console.log('-'.repeat(50));

        if (message.isStatus) return;
        if (!msg.startsWith('!')) return;

        let response = '';

     // COMANDO MENU - IMAGEM COM LEGENDA

if (msg === '!menu' || msg === '!ajuda' || msg === '!help') {
    const menuText = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     ✨ 𝐑𝐀𝐂𝐇𝐄𝐋 𝐁𝐎𝐓 ✨
  ⭐ 𝑴𝒆𝒏𝒖 𝒅𝒂 𝑻𝒐𝒓𝒓𝒆 𝒅𝒆 𝑫𝒆𝒖𝒔 ⭐
╰═•ೋ✧๑🥂๑✧ೋ•═╯

"Eu vou ver as estrelas... não importa o que aconteça."

╭═•ೋ✧๑🥂๑✧ೋ•═╮
  𝐒𝐈𝐒𝐓𝐄𝐌𝐀 & 𝐒𝐓𝐀𝐓𝐔𝐒
╰═•ೋ✧๑🥂๑✧ೋ•═╯
╎⁑ۣۜۜ͜͡⭐ !nivel - Status completo
╎⁑ۣۜۜ͜͡⭐ !xp - Ver XP atual
╎⁑ۣۜۜ͜͡⭐ !vida - Ver vida atual
╎⁑ۣۜۜ͜͡⭐ !perfil - Seu perfil completo
╎⁑ۣۜۜ͜͡⭐ !teste - Testar bot
╎⁑ۣۜۜ͜͡⭐ !criador - Info do criador

╭═•ೋ✧๑🥂๑✧ೋ•═╮
  𝐑𝐀𝐍𝐊𝐈𝐍𝐆𝐒 & 𝐓𝐎𝐏
╰═•ೋ✧๑🥂๑✧ೋ•═╯
╎⁑ۣۜۜ͜͡⭐ !ranking - Top 10 níveis
╎⁑ۣۜۜ͜͡⭐ !rank - Atalho ranking
╎⁑ۣۜۜ͜͡⭐ !top - Atalho top
╎⁑ۣۜۜ͜͡⭐ !toprico - Top 10 mais ricos
╎⁑ۣۜۜ͜͡⭐ !topmoedas - Atalho top moedas
╎⁑ۣۜۜ͜͡⭐ !toppoder - Top 10 mais fortes
╎⁑ۣۜۜ͜͡⭐ !topforte - Atalho top forte

╭═•ೋ✧๑🥂๑✧ೋ•═╮
  𝐄𝐂𝐎𝐍𝐎𝐌𝐈𝐀
╰═•ೋ✧๑🥂๑✧ೋ•═╯
╎⁑ۣۜۜ͜͡⭐ !daily - Recompensa diária
╎⁑ۣۜۜ͜͡⭐ !diario - Atalho daily
╎⁑ۣۜۜ͜͡⭐ !trabalhar - Ganhar moedas
╎⁑ۣۜۜ͜͡⭐ !saldo - Ver suas moedas
╎⁑ۣۜۜ͜͡⭐ !apostar - Apostar moedas

╭═•ೋ✧๑🥂๑✧ೋ•═╮
  𝐓𝐎𝐑𝐑𝐄 & 𝐀𝐕𝐄𝐍𝐓𝐔𝐑𝐀
╰═•ೋ✧๑🥂๑✧ೋ•═╯
╎⁑ۣۜۜ͜͡⭐ !explorar - Explorar a Torre
╎⁑ۣۜۜ͜͡⭐ !desafiar @user - Duelar
╎⁑ۣۜۜ͜͡⭐ !duelar @user - Atalho desafiar
╎⁑ۣۜۜ͜͡⭐ !atacar - Atacar na batalha
╎⁑ۣۜۜ͜͡⭐ !attack - Atalho atacar
╎⁑ۣۜۜ͜͡⭐ !batalhas - Ver duelos ativos
╎⁑ۣۜۜ͜͡⭐ !duelos - Atalho batalhas

╭═•ೋ✧๑🥂๑✧ೋ•═╮
  𝐋𝐎𝐉𝐀 & 𝐈𝐓𝐄𝐍𝐒
╰═•ೋ✧๑🥂๑✧ೋ•═╯
╎⁑ۣۜۜ͜͡⭐ !loja - Ver loja
╎⁑ۣۜۜ͜͡⭐ !comprar [item] - Comprar item
╎⁑ۣۜۜ͜͡⭐ !inventario - Ver seus itens
╎⁑ۣۜۜ͜͡⭐ !inventário - Atalho inventário
╎⁑ۣۜۜ͜͡⭐ !usar [item] - Usar item
╎⁑ۣۜۜ͜͡⭐ !vender [item] - Vender item

╭═•ೋ✧๑🥂๑✧ೋ•═╮
  𝐉𝐎𝐆𝐎𝐒 & 𝐃𝐈𝐕𝐄𝐑𝐒𝐀̃𝐎
╰═•ೋ✧๑🥂๑✧ೋ•═╯
╎⁑ۣۜۜ͜͡⭐ !forca - Jogo da forca
╎⁑ۣۜۜ͜͡⭐ !rf [letra] - Responder forca
╎⁑ۣۜۜ͜͡⭐ !caracoroa [cara/coroa] [valor] - Apostar
╎⁑ۣۜۜ͜͡⭐ !coinflip [cara/coroa] [valor] - Atalho cara coroa
╎⁑ۣۜۜ͜͡⭐ !slot [valor] - Caça-níquel
╎⁑ۣۜۜ͜͡⭐ !dado - Rolar dado
╎⁑ۣۜۜ͜͡⭐ !dice - Atalho dado
╎⁑ۣۜۜ͜͡⭐ !piada - Piada aleatória

╭═•ೋ✧๑🥂๑✧ೋ•═╮
  𝐒𝐎𝐂𝐈𝐀𝐋 & 𝐓𝐑𝐎𝐂𝐀𝐒
╰═•ೋ✧๑🥂๑✧ೋ•═╯
╎⁑ۣۜۜ͜͡⭐ !casar @user - Propor casamento
╎⁑ۣۜۜ͜͡⭐ !aceitarcasamento - Aceitar pedido
╎⁑ۣۜۜ͜͡⭐ !divorciar - Divórcio
╎⁑ۣۜۜ͜͡⭐ !divórcio - Atalho divórcio
╎⁑ۣۜۜ͜͡⭐ !casal - Info do relacionamento
╎⁑ۣۜۜ͜͡⭐ !presentear @user [valor] - Dar presente
╎⁑ۣۜۜ͜͡⭐ !trocar @user [item1] [item2] - Trocar itens
╎⁑ۣۜۜ͜͡⭐ !aceitartroca [ID] - Aceitar troca
╎⁑ۣۜۜ͜͡⭐ !minhatrocas - Ver suas propostas
╎⁑ۣۜۜ͜͡⭐ !trocas - Atalho minhatrocas

╭═•ೋ✧๑🥂๑✧ೋ•═╮
  𝐈𝐍𝐓𝐄𝐑𝐀𝐂̧𝐀̃𝐎
╰═•ೋ✧๑🥂๑✧ೋ•═╯
╎⁑ۣۜۜ͜͡⭐ !quote - Frase da Rachel
╎⁑ۣۜۜ͜͡⭐ !frase - Atalho quote
╎⁑ۣۜۜ͜͡⭐ !perguntar [pergunta] - Perguntar
╎⁑ۣۜۜ͜͡⭐ !conselho - Conselho da Rachel
╎⁑ۣۜۜ͜͡⭐ !sticker - Criar figurinha
╎⁑ۣۜۜ͜͡⭐ !s - Atalho sticker
╎⁑ۣۜۜ͜͡⭐ !fig - Atalho fig
╎⁑ۣۜۜ͜͡⭐ !stickernome [texto] - Figurinha customizada
╎⁑ۣۜۜ͜͡⭐ !sn [texto] - Atalho stickernome
╎⁑ۣۜۜ͜͡⭐ !stickersem - Figurinha sem marca
╎⁑ۣۜۜ͜͡⭐ !ss - Atalho stickersem
╎⁑ۣۜۜ͜͡⭐ !stickerinfo - Info sobre stickers
╎⁑ۣۜۜ͜͡⭐ !infofi - Atalho stickerinfo

╭═•ೋ✧๑🥂๑✧ೋ•═╮
  𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 𝐀𝐃𝐌𝐈𝐍
╰═•ೋ✧๑🥂๑✧ೋ•═╯
╎⁑ۣۜۜ͜͡⭐ !ban @user - Banir usuário
╎⁑ۣۜۜ͜͡⭐ !promover @user - Promover admin
╎⁑ۣۜۜ͜͡⭐ !rebaixar @user - Rebaixar admin
╎⁑ۣۜۜ͜͡⭐ !advertir @user [motivo] - Advertir
╎⁑ۣۜۜ͜͡⭐ !mute - Silenciar grupo
╎⁑ۣۜۜ͜͡⭐ !desmute - Dessilenciar grupo
╎⁑ۣۜۜ͜͡⭐ !marcar - Marcar todos
╎⁑ۣۜۜ͜͡⭐ !admins - Ver lista de admins
╎⁑ۣۜۜ͜͡⭐ !infogrupo - Info do grupo
╎⁑ۣۜۜ͜͡⭐ !banghost - Ban Ghost (⚠️ Perigo!)
╎⁑ۣۜۜ͜͡⭐ !confirmarban - Confirmar ban ghost
╎⁑ۣۜۜ͜͡⭐ !cancelar - Cancelar operação

╭═•ೋ✧๑🥂๑✧ೋ•═╮
  ⚡ 𝐀𝐓𝐀𝐋𝐇𝐎𝐒 & 𝐈𝐍𝐓𝐎
╰═•ೋ✧๑🥂๑✧ೋ•═╯
╎⁑ۣۜۜ͜͡⭐ !ajuda - Ver este menu
╎⁑ۣۜۜ͜͡⭐ !help - Atalho ajuda
╎⁑ۣۜۜ͜͡⭐ !menu - Atalho menu
╎⁑ۣۜۜ͜͡⭐ !criador - Info do criador
╎⁑ۣۜۜ͜͡⭐ !creator - Atalho criador
╎⁑ۣۜۜ͜͡⭐ !dev - Atalho criador

╭═•ೋ✧๑🥂๑✧ೋ•═╮
  💡 𝐃𝐈𝐂𝐀𝐒 𝐔́𝐓𝐄𝐈𝐒
╰═•ೋ✧๑🥂๑✧ೋ•═╯
💰 Ganhe moedas: !trabalhar, !explorar, !daily
📈 Suba de nível: Jogue qualquer mini-jogo
💍 Social: Faça amizades, case-se, troque itens
🎮 Diversão: Forca, caracoroa, slot, dados
🖼️ Criativo: Crie figurinhas personalizadas

╭═•ೋ✧๑🥂๑✧ೋ•═╮
"𝑺𝒖𝒃𝒂 𝒂 𝑻𝒐𝒓𝒓𝒆 𝒄𝒐𝒎𝒊𝒈𝒐.
𝑽𝒂𝒎𝒐𝒔 𝒗𝒆𝒓 𝒂𝒔 𝒆𝒔𝒕𝒓𝒆𝒍𝒂𝒔 𝒋𝒖𝒏𝒕𝒐𝒔."
╰═•ೋ✧๑🥂๑✧ೋ•═╯

✨ 𝐁𝐘: 𝐑𝐀𝐂𝐇𝐄𝐋 𝐁𝐎𝐓 ✨
🌟 "𝑨𝒔 𝒆𝒔𝒕𝒓𝒆𝒍𝒂𝒔 𝒏𝒐𝒔 𝒆𝒔𝒑𝒆𝒓𝒂𝒎..." 🌟`;

    try {
        // Procura por extensões de imagem comuns
        const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        let imagePath = null;

        for (const ext of imageExtensions) {
            const testPath = path.join(__dirname, 'media', `menu.${ext}`);
            if (fs.existsSync(testPath)) {
                imagePath = testPath;
                console.log('✅ Imagem encontrada:', testPath);
                break;
            }
        }

        if (!imagePath) {
            console.log('❌ Nenhuma imagem do menu encontrada em media/');
            console.log('💡 Procurando: menu.jpg, menu.jpeg, menu.png, menu.webp');
            await message.reply(menuText);
            return;
        }

        // Lê a imagem e cria o MessageMedia
        const fileData = fs.readFileSync(imagePath, { encoding: 'base64' });
        const extension = path.extname(imagePath).toLowerCase().replace('.', '');
        const mimeType = extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : `image/${extension}`;
        
        const menuMedia = new MessageMedia(mimeType, fileData, `menu.${extension}`);
        
        console.log('📤 Enviando imagem com legenda...');
        
        await client.sendMessage(message.from, menuMedia, {
            caption: menuText
        });
        
        console.log('✅ Menu enviado com sucesso!');

    } catch (error) {
        console.error('❌ Erro ao enviar menu:', error.message);
        console.error('Stack:', error.stack);
        await message.reply('❌ Ocorreu um erro ao enviar o menu. Tente novamente.');
    }
}
// COMANDO !CRIADOR
// Cole este código no seu bot.js junto com os outros comandos

if (msg === '!criador' || msg === '!creator' || msg === '!dev') {
    const criadorText = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     👑 𝐂𝐑𝐈𝐀𝐃𝐎𝐑 𝐃𝐎 𝐁𝐎𝐓 👑
╰═•ೋ✧๑🥂๑✧ೋ•═╯

✨ *Olá! Eu sou a Rachel Bot* ✨

Fui criada com muito carinho e dedicação
para trazer diversão e aventura inspirada
na Torre de Deus! 🗼

╭═•ೋ✧๑🥂๑✧ೋ•═╮
  💎 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂̧𝐎̃𝐄𝐒
╰═•ೋ✧๑🥂๑✧ೋ•═╯

👤 *Desenvolvedor:* [Light shizuke]
📱 *Contato:* [+55 35 998381353]
🌐 *GitHub:* [Lightshzk]
💻 *Tecnologias:* Node.js + whatsapp-web.js

╭═•ೋ✧๑🥂๑✧ೋ•═╮
"Cada linha de código foi escrita
pensando em criar a melhor experiência
para você subir a Torre!" 🌟
╰═•ೋ✧๑🥂๑✧ೋ•═╯

💡 *Quer sugerir melhorias?*
Entre em contato comigo!

✨ 𝐑𝐀𝐂𝐇𝐄𝐋 𝐁𝐎𝐓 - 𝐕𝐞𝐫𝐬𝐚̃𝐨 𝟏.𝟎 ✨
🌟 "As estrelas nos esperam..." 🌟`;

    try {
        await message.reply(criadorText);
        console.log('✅ Comando !criador executado');
    } catch (error) {
        console.error('❌ Erro no comando !criador:', error.message);
    }
}
        else if (msg === '!teste' || msg === '!test') {
            response = "✅ Estou funcionando perfeitamente. A Torre me aguarda...";
        }

        else if (msg === '!quote' || msg === '!frase') {
            const allQuotes = [...rachelPersonality.aboutHer, ...rachelPersonality.aboutBam, ...rachelPersonality.aboutTower, ...rachelPersonality.manipulation];
            response = `💭 "${getRandomResponse(allQuotes)}"`;
        }

        else if (msg === '!perfil') {
            let nomePerfil = 'Andarilho';
            let numeroWhats = 'Desconhecido';
            try {
                const contato = await message.getContact();
                if (contato) {
                    if (contato.pushname) nomePerfil = contato.pushname;
                    if (contato.number) numeroWhats = contato.number;
                }
            } catch (e) {
                nomePerfil = 'Andarilho';
            }
            
            response = `👤 *Seu Perfil*
• Nome: ${nomePerfil}
• Número: ${numeroWhats}
• Rachel te julga: "Você nunca subiria a Torre..."`;
        }

        else if (msg === '!piada') {
            const piadas = [
                "Por que o Bam leva sempre uma escada? Porque ele não confia em elevadores da Torre!",
                "O que acontece se você desafiar o Khun para uma corrida? Prepare-se para perder, e rápido!",
                "Qual é a bebida favorita dos habitantes da Torre? Energético… porque ninguém descansa por aqui!",
                "Por que a Rachel nunca perde uma estrela? Porque ela tem sempre um plano… e uma boa desculpa!"
            ];
            response = `😂 ${getRandomResponse(piadas)}`;
        }

        else if (msg === '!nivel') {
            inicializarJogador(userId);
            const nivel = torreXP[userId].nivel;
            const xp = torreXP[userId].xp;
            const xpProximo = torreXP[userId].xpProximoNivel;
            const vida = torreVida[userId] || 100;
            const poder = calcularPoder(userId);
            const moedas = torreMoney[userId] || 0;
            
            response = `⚡ *SEU STATUS* ⚡\n\n📊 Nível: ${nivel}\n💫 XP: ${xp}/${xpProximo}\n❤️ Vida: ${vida}/100\n⚔️ Poder: ${poder}\n💰 Moedas: ${moedas}`;
        }

        else if (msg === '!xp') {
            inicializarJogador(userId);
            const xp = torreXP[userId].xp;
            const xpProximo = torreXP[userId].xpProximoNivel;
            response = `💫 XP Atual: ${xp}/${xpProximo}`;
        }

        else if (msg === '!forca') {
            const groupId = message.from;
            
            if (forcaGames.has(groupId)) {
                await message.reply('⚠️ Já existe um jogo da forca em andamento! Use !rf [letra] ou !rf [palavra] para jogar.');
                return;
            }

            const escolhido = palavrasForca[Math.floor(Math.random() * palavrasForca.length)];
            
            forcaGames.set(groupId, {
                palavra: escolhido.palavra.toLowerCase(),
                dica: escolhido.dica,
                letrasReveladas: Array(escolhido.palavra.length).fill('_'),
                letrasUsadas: [],
                tentativas: 6,
                jogadores: new Set(),
                timestamp: Date.now()
            });

            const display = forcaGames.get(groupId).letrasReveladas.join(' ');
            
            const forcaText = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     🎮 𝐉𝐎𝐆𝐎 𝐃𝐀 𝐅𝐎𝐑𝐂𝐀 🎮
╰═•ೋ✧๑🥂๑✧ೋ•═╯

${desenharForca(6)}

📝 Palavra: ${display}
💡 Dica: ${escolhido.dica}
❌ Erros: 0/6
💀 Letras erradas: -

╎⁑ۣۜۜ͜͡⭐ Use !rf [letra] para uma letra
╎⁑ۣۜۜ͜͡⭐ Use !rf [palavra] para palavra completa

🎯 Todos podem jogar juntos!`;

            await message.reply(forcaText);
            console.log('✅ Jogo da forca iniciado:', escolhido.palavra);
        }

        else if (msg.startsWith('!rf ')) {
            const groupId = message.from;
            const playerId = message.author || message.from;
            
            if (!forcaGames.has(groupId)) {
                response = '⚠️ Não há jogo da forca em andamento! Use !forca para começar.';
            } else {
                const game = forcaGames.get(groupId);
                const resposta = msg.substring(4).trim().toLowerCase();

                // Adiciona jogador à lista
                game.jogadores.add(playerId);

                // Tenta palavra completa
                if (resposta.length > 1) {
                    if (resposta === game.palavra) {
                        // ACERTOU A PALAVRA!
                        const vencedorText = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     🎉 𝐏𝐀𝐑𝐀𝐁𝐄́𝐍𝐒! 🎉
╰═•ೋ✧๑🥂๑✧ೋ•═╯

${desenharForca(game.tentativas)}

✅ A palavra era: *${game.palavra.toUpperCase()}*
🏆 Palavra completa acertada!

👥 Jogadores participantes: ${game.jogadores.size}
💰 Recompensa: +${game.jogadores.size * 50} moedas cada

🌟 "Vocês subiram a Torre juntos!" 🌟`;

                        await message.reply(vencedorText);
                        
                        // Recompensa para todos
                        for (const jogador of game.jogadores) {
                            torreMoney[jogador] = (torreMoney[jogador] || 0) + (game.jogadores.size * 50);
                            adicionarXP(jogador, 60);
                        }
                        salvarMoney();
                        
                        forcaGames.delete(groupId);
                        console.log('✅ Palavra completa acertada:', game.palavra);
                        return;
                    } else {
                        // ERROU A PALAVRA
                        game.tentativas--;
                        
                        if (game.tentativas <= 0) {
                            const gameOverText = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     💀 𝐆𝐀𝐌𝐄 𝐎𝐕𝐄𝐑 💀
╰═•ೋ✧๑🥂๑✧ೋ•═╯

${desenharForca(0)}

❌ A palavra era: *${game.palavra.toUpperCase()}*
💭 Dica: ${game.dica}
😢 Palavra "${resposta}" estava errada!

👥 Jogadores que tentaram: ${game.jogadores.size}

🌟 "A Torre não perdoa erros..." 🌟`;

                            await message.reply(gameOverText);
                            forcaGames.delete(groupId);
                            console.log('❌ Game Over - Palavra errada');
                            return;
                        } else {
                            const display = game.letrasReveladas.join(' ');
                            const errosText = game.letrasUsadas.filter(l => !game.palavra.includes(l)).join(', ');
                            
                            const erroText = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     ❌ 𝐏𝐀𝐋𝐀𝐕𝐑𝐀 𝐄𝐑𝐑𝐀𝐃𝐀! ❌
╰═•ೋ✧๑🥂๑✧ೋ•═╯

${desenharForca(game.tentativas)}

📝 Palavra: ${display}
❌ "${resposta}" não é a palavra!
💀 Erros: ${6 - game.tentativas}/6
💡 Letras erradas: ${errosText || '-'}

🎯 Continue tentando!`;

                            await message.reply(erroText);
                            return;
                        }
                    }
                }

                // Validação de letra única
                const letra = resposta;
                if (!/^[a-z]$/.test(letra)) {
                    response = '⚠️ Use apenas UMA letra ou a PALAVRA COMPLETA!\n\nExemplo: !rf a ou !rf rachel';
                } else if (game.letrasUsadas.includes(letra)) {
                    response = `⚠️ A letra *${letra}* já foi usada! Tente outra.`;
                } else {
                    game.letrasUsadas.push(letra);
                    
                    // Verifica se acertou
                    let acertou = false;
                    for (let i = 0; i < game.palavra.length; i++) {
                        if (game.palavra[i] === letra) {
                            game.letrasReveladas[i] = letra;
                            acertou = true;
                        }
                    }

                    if (acertou) {
                        const display = game.letrasReveladas.join(' ');
                        
                        // Verifica se completou
                        if (!game.letrasReveladas.includes('_')) {
                            const vencedorText = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     🎉 𝐏𝐀𝐑𝐀𝐁𝐄́𝐍𝐒! 🎉
╰═•ೋ✧๑🥂๑✧ೋ•═╯

${desenharForca(game.tentativas)}

✅ A palavra era: *${game.palavra.toUpperCase()}*
🏆 Completada com sucesso!

👥 Jogadores participantes: ${game.jogadores.size}
💰 Recompensa: +30 moedas cada

🌟 "Vocês subiram a Torre juntos!" 🌟`;

                            await message.reply(vencedorText);
                            
                            for (const jogador of game.jogadores) {
                                torreMoney[jogador] = (torreMoney[jogador] || 0) + 30;
                                adicionarXP(jogador, 40);
                            }
                            salvarMoney();
                            
                            forcaGames.delete(groupId);
                            console.log('✅ Forca completada:', game.palavra);
                            return;
                        } else {
                            const errosText = game.letrasUsadas.filter(l => !game.palavra.includes(l)).join(', ');
                            
                            response = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     ✅ 𝐋𝐄𝐓𝐑𝐀 𝐂𝐎𝐑𝐑𝐄𝐓𝐀! ✅
╰═•ೋ✧๑🥂๑✧ೋ•═╯

${desenharForca(game.tentativas)}

📝 Palavra: ${display}
✅ Letra *${letra}* encontrada!
❌ Erros: ${6 - game.tentativas}/6
💡 Letras erradas: ${errosText || '-'}

🎯 Continue! Todos podem jogar!`;
                        }
                    } else {
                        // LETRA ERRADA
                        game.tentativas--;
                        
                        if (game.tentativas <= 0) {
                            const gameOverText = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     💀 𝐆𝐀𝐌𝐄 𝐎𝐕𝐄𝐑 💀
╰═•ೋ✧๑🥂๑✧ೋ•═╯

${desenharForca(0)}

❌ A palavra era: *${game.palavra.toUpperCase()}*
💭 Dica: ${game.dica}

👥 Jogadores que tentaram: ${game.jogadores.size}

🌟 "A Torre não perdoa erros..." 🌟`;

                            await message.reply(gameOverText);
                            forcaGames.delete(groupId);
                            console.log('❌ Game Over');
                            return;
                        } else {
                            const display = game.letrasReveladas.join(' ');
                            const errosText = game.letrasUsadas.filter(l => !game.palavra.includes(l)).join(', ');
                            
                            response = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     ❌ 𝐋𝐄𝐓𝐑𝐀 𝐄𝐑𝐑𝐀𝐃𝐀! ❌
╰═•ೋ✧๑🥂๑✧ೋ•═╯

${desenharForca(game.tentativas)}

📝 Palavra: ${display}
❌ Letra *${letra}* não está na palavra
💀 Erros: ${6 - game.tentativas}/6
💡 Letras erradas: ${errosText}

🎯 Tentem outra letra ou palavra!`;
                        }
                    }
                }
            }
        }

        else if (msg === '!ranking' || msg === '!rank' || msg === '!top') {
            const topNivel = getTopRanking('nivel', 10);
            
            let texto = '🏆 *RANKING DA TORRE* 🏆\n';
            texto += '━━━━━━━━━━━━━━━\n\n';
            
            for (let i = 0; i < topNivel.length; i++) {
                const numero = topNivel[i].userId.replace('@c.us', '').replace('@s.whatsapp.net', '');
                const medal = getMedalha(i + 1);
                texto += `${medal} Nível ${topNivel[i].valor} - (${topNivel[i].xp} XP)\n`;
                texto += `   ${numero.slice(-4)}\n\n`;
            }
            
            const todasPosicoes = getTopRanking('nivel', 999);
            const minhaPos = todasPosicoes.findIndex(p => p.userId === userId) + 1;
            
            if (minhaPos > 10) {
                texto += `━━━━━━━━━━━━━━━\n`;
                texto += `📍 Sua posição: ${minhaPos}º\n`;
                texto += `⚡ Nível: ${torreXP[userId]?.nivel || 1}`;
            }
            
            response = texto;
        }

        else if (msg === '!toprico' || msg === '!topmoedas') {
            const topMoedas = getTopRanking('moedas', 10);
            let texto = '💰 *TOP MAIS RICOS* 💰\n━━━━━━━━━━━━━━━\n\n';
            
            for (let i = 0; i < topMoedas.length; i++) {
                texto += `${getMedalha(i + 1)} ${topMoedas[i].valor} moedas\n\n`;
            }
            
            response = texto;
        }

        else if (msg === '!toppoder' || msg === '!topforte') {
            const topPoder = getTopRanking('poder', 10);
            let texto = '⚔️ *TOP MAIS FORTES* ⚔️\n━━━━━━━━━━━━━━━\n\n';
            
            for (let i = 0; i < topPoder.length; i++) {
                texto += `${getMedalha(i + 1)} Poder ${topPoder[i].valor}\n\n`;
            }
            
            response = texto;
        }

        else if (msg === '!daily' || msg === '!diario') {
            const resultado = verificarDaily(userId);
            
            if (!resultado.disponivel) {
                const proximoDaily = new Date();
                proximoDaily.setDate(proximoDaily.getDate() + 1);
                proximoDaily.setHours(0, 0, 0, 0);
                
                const horasRestantes = Math.floor((proximoDaily - new Date()) / 1000 / 60 / 60);
                const minutosRestantes = Math.floor(((proximoDaily - new Date()) / 1000 / 60) % 60);
                
                response = `⏰ ${resultado.mensagem}\n\n⏳ Próximo daily em: ${horasRestantes}h ${minutosRestantes}m\n🔥 Streak atual: ${torreDaily[userId]?.streak || 0} dias`;
            } else {
                response = `🎁 *RECOMPENSA DIÁRIA COLETADA!* 🎁\n\n💰 +${resultado.moedas} moedas\n${resultado.xpMsg}\n🔥 Streak: ${resultado.streak} dias${resultado.bonus}\n\n💡 Volte amanhã para manter o streak!`;
            }
        }

        else if (msg.startsWith('!caracoroa ') || msg.startsWith('!coinflip ')) {
            const partes = msg.split(' ');
            if (partes.length < 3) {
                response = '❌ Use: !caracoroa [cara/coroa] [valor]\nEx: !caracoroa cara 50';
            } else {
                const escolha = partes[1].toLowerCase();
                const aposta = parseInt(partes[2]);
                
                if (!['cara', 'coroa'].includes(escolha)) {
                    response = '❌ Escolha "cara" ou "coroa"!';
                } else if (isNaN(aposta) || aposta < 10) {
                    response = '❌ Aposta mínima: 10 moedas';
                } else if ((torreMoney[userId] || 0) < aposta) {
                    response = '❌ Você não tem moedas suficientes!';
                } else {
                    const resultado = jogarCaraCoroa(escolha);
                    
                    if (resultado.ganhou) {
                        torreMoney[userId] += aposta;
                        response = `🪙 *${resultado.resultado.toUpperCase()}!*\n\n✅ Você GANHOU!\n💰 +${aposta} moedas\n💵 Saldo: ${torreMoney[userId]}`;
                    } else {
                        torreMoney[userId] -= aposta;
                        response = `🪙 *${resultado.resultado.toUpperCase()}!*\n\n❌ Você PERDEU!\n💸 -${aposta} moedas\n💵 Saldo: ${torreMoney[userId]}`;
                    }
                    salvarMoney();
                }
            }
        }

        else if (msg === '!dado' || msg === '!dice') {
            const resultado = rolarDado();
            const emojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
            response = `🎲 Você rolou: ${emojis[resultado - 1]} *${resultado}*`;
        }

        else if (msg.startsWith('!slot ')) {
            const aposta = parseInt(msg.replace('!slot ', ''));
            
            if (isNaN(aposta) || aposta < 20) {
                response = '❌ Use: !slot [valor]\nAposta mínima: 20 moedas';
            } else if ((torreMoney[userId] || 0) < aposta) {
                response = '❌ Você não tem moedas suficientes!';
            } else {
                const jogo = jogarSlot();
                torreMoney[userId] -= aposta;
                
                let texto = `🎰 *CAÇA-NÍQUEL* 🎰\n\n${jogo.resultado.join(' | ')}\n\n`;
                
                if (jogo.multiplicador > 0) {
                    const ganho = aposta * jogo.multiplicador;
                    torreMoney[userId] += ganho;
                    texto += `🎉 *VOCÊ GANHOU!*\n💰 +${ganho} moedas (${jogo.multiplicador}x)\n💵 Saldo: ${torreMoney[userId]}`;
                } else {
                    texto += `😢 Não foi dessa vez...\n💸 -${aposta} moedas\n💵 Saldo: ${torreMoney[userId]}`;
                }
                
                salvarMoney();
                response = texto;
            }
        }

        else if (msg.startsWith('!casar ')) {
            if (!message.mentionedIds || message.mentionedIds.length === 0) {
                response = '❌ Marque alguém para propor casamento!\nEx: !casar @pessoa';
            } else {
                const parceiro = message.mentionedIds[0];
                
                if (parceiro === userId) {
                    response = '❌ Você não pode casar consigo mesmo!';
                } else {
                    const statusUser = verificarCasado(userId);
                    const statusParceiro = verificarCasado(parceiro);
                    
                    if (statusUser.casado) {
                        response = '❌ Você já está casado(a)!';
                    } else if (statusParceiro.casado) {
                        response = '❌ Esta pessoa já está casada!';
                    } else if (verificarPropostaCasamento(parceiro)) {
                        response = '❌ Esta pessoa já tem uma proposta de casamento pendente!';
                    } else {
                        criarPropostaMatrimonio(userId, parceiro);
                        response = `💍 Proposta de casamento enviada!\n\nA pessoa deve aceitar com: !aceitarcasamento`;
                    }
                }
            }
        }

        else if (msg === '!aceitarcasamento') {
            const proposta = verificarPropostaCasamento(userId);
            
            if (!proposta) {
                response = '❌ Você não tem propostas de casamento pendentes!';
            } else {
                criarCasamento(proposta.de, userId);
                deletarPropostaCasamento(userId);
                response = `💍💕 *CASAMENTO REALIZADO!* 💕💍\n\nVocês agora são um casal!\n\n🎁 Bônus de casal:\n• +10% XP quando joga juntos\n• Comandos especiais de casal\n\nUse !casal para ver informações!`;
            }
        }

        else if (msg === '!divorciar' || msg === '!divórcio') {
            const status = verificarCasado(userId);
            
            if (!status.casado) {
                response = '❌ Você não está casado(a)!';
            } else {
                delete torreCasamento[status.casal];
                salvarCasamento();
                response = '💔 Divórcio realizado... A Torre não perdoa relacionamentos.';
            }
        }

        else if (msg === '!casal') {
            const status = verificarCasado(userId);
            
            if (!status.casado) {
                response = '❌ Você não está casado(a)!';
            } else {
                const casal = torreCasamento[status.casal];
                const dataCasamento = new Date(casal.data);
                const diasJuntos = Math.floor((Date.now() - dataCasamento.getTime()) / (1000 * 60 * 60 * 24));
                
                response = `💑 *INFORMAÇÕES DO CASAL* 💑\n\n💕 Dias juntos: ${diasJuntos}\n✨ XP compartilhado: ${casal.xpCompartilhado}\n\n"O amor também existe na Torre..."`;
            }
        }

        else if (msg.startsWith('!perguntar ')) {
            const pergunta = msg.replace('!perguntar ', '');
            response = `💭 Rachel responde:\n\n"${rachelResponder(pergunta)}"`;
        }

        else if (msg === '!conselho') {
            response = `💡 *Conselho da Rachel:*\n\n"${rachelConselho()}"`;
        }

        else if (msg === '!saldo') {
            const saldo = torreMoney[userId] || 0;
            response = `💰 Seu saldo na Torre: ${saldo} moedas.`;
        }

        else if (msg === '!trabalhar') {
            const cooldown = verificarCooldown(userId, 'trabalhar', 60);
            if (cooldown.emCooldown) {
                response = `⏳ Aguarde ${cooldown.tempoRestante}s para trabalhar novamente!`;
            } else {
                const ganho = Math.floor(Math.random() * 50) + 10;
                torreMoney[userId] = (torreMoney[userId] || 0) + ganho;
                salvarMoney();
                
                const xpMsg = adicionarXP(userId, 10);
                response = `🛠️ Você trabalhou duro na Torre e ganhou ${ganho} moedas!${xpMsg}\n💰 Saldo atual: ${torreMoney[userId]} moedas.`;
            }
        }

        else if (msg === '!explorar') {
            const cooldown = verificarCooldown(userId, 'explorar', 120);
            if (cooldown.emCooldown) {
                response = `⏳ Aguarde ${cooldown.tempoRestante}s para explorar novamente!`;
            } else {
                if (torreVida[userId] === undefined) torreVida[userId] = 100;
                let vida = torreVida[userId];

                if (vida <= 0) {
                    response = '💀 Você está sem vida! Use uma poção para se curar.';
                    return;
                } else {
                    const andares = ["Andar 2 - Campo de Testes", "Andar 5 - Floresta dos Guerreiros", "Andar 13 - Lago do Shinsu", "Andar 20 - Torre dos Deuses"];
                    const eventos = ["encontrou um baú misterioso", "lutou contra um monstro e venceu", "achou moedas perdidas", "recebeu ajuda de um guia"];

                    const andar = andares[Math.floor(Math.random() * andares.length)];
                    const evento = eventos[Math.floor(Math.random() * eventos.length)];
                    const ganhoMoedas = Math.floor(Math.random() * 50) + 10;

                    let texto = `🧭 Você explorou o *${andar}* e ${evento}!\n`;
                    texto += `💰 Você ganhou *${ganhoMoedas} moedas!*`;

                    torreMoney[userId] = (torreMoney[userId] || 0) + ganhoMoedas;
                    salvarMoney();

                    const xpMsg = adicionarXP(userId, 20);
                    texto += xpMsg;

                    if (Math.random() < 0.3) {
                        const dano = Math.floor(Math.random() * 20) + 5;
                        vida = Math.max(0, vida - dano);
                        texto += `\n💔 Você perdeu *${dano} de vida* durante a exploração!`;
                    }

                    torreVida[userId] = vida;
                    salvarVida();
                    texto += `\n❤️ Vida atual: ${vida}/100`;
                    response = texto;
                }
            }
        }

        else if (msg === '!vida') {
            const vida = torreVida[userId] === undefined ? 100 : torreVida[userId];
            response = `❤️ Sua vida atual: ${vida}/100`;
        }

        else if (msg === '!loja') {
            response = `🏪 *Loja da Torre*
poção - 30 moedas (Recupera 30 de vida)
lanterna - 50 moedas
mapa - 80 moedas
shinsu - 100 moedas

Compre usando: !comprar [item]`;
        }

        else if (msg.startsWith('!comprar ')) {
            const item = msg.replace('!comprar ', '').trim();
            const loja = { "poção": 30, "pocao": 30, "lanterna": 50, "mapa": 80, "shinsu": 100 };
            
            if (!loja[item]) {
                response = '❌ Item não encontrado na loja. Itens: poção, lanterna, mapa, shinsu';
            } else if ((torreMoney[userId] || 0) < loja[item]) {
                response = '💸 Você não tem moedas suficientes.';
            } else {
                torreMoney[userId] -= loja[item];
                salvarMoney();
                
                if (!torreInventario[userId]) torreInventario[userId] = [];
                torreInventario[userId].push(item);
                salvarInventario();
                
                response = `🛒 Você comprou *${item}* por ${loja[item]} moedas!\n💰 Saldo: ${torreMoney[userId]} moedas.`;
            }
        }

        else if (msg === '!inventario' || msg === '!inventário') {
            const itens = torreInventario[userId] || [];
            response = itens.length === 0 ? '🎒 Seu inventário está vazio.' : `🎒 *Seu inventário:*\n- ${itens.join('\n- ')}`;
        }

        else if (msg.startsWith('!usar ')) {
            const item = msg.replace('!usar ', '').trim();
            const inventario = torreInventario[userId] || [];
            const idx = inventario.findIndex(i => i === item || i === 'poção' && item === 'pocao');

            if (idx === -1) {
                response = '❌ Você não possui esse item no inventário.';
            } else if (item === 'poção' || item === 'pocao') {
                torreVida[userId] = Math.min((torreVida[userId] || 100) + 30, 100);
                inventario.splice(idx, 1);
                torreInventario[userId] = inventario;
                salvarVida();
                salvarInventario();
                response = `🧪 Você usou uma *poção* e recuperou 30 de vida!\n❤️ Vida atual: ${torreVida[userId]}/100`;
            } else {
                response = '❌ Esse item não pode ser usado agora.';
            }
        }

        else if (msg.startsWith('!vender ')) {
            const item = msg.replace('!vender ', '').trim();
            const inventario = torreInventario[userId] || [];
            const idx = inventario.indexOf(item);
            const precos = { "poção": 15, "pocao": 15, "lanterna": 25, "mapa": 40, "shinsu": 50 };

            if (idx === -1) {
                response = '❌ Você não possui esse item no inventário.';
            } else if (!precos[item]) {
                response = '❌ Esse item não pode ser vendido.';
            } else {
                inventario.splice(idx, 1);
                torreInventario[userId] = inventario;
                torreMoney[userId] = (torreMoney[userId] || 0) + precos[item];
                salvarInventario();
                salvarMoney();
                response = `💸 Você vendeu *${item}* por ${precos[item]} moedas!`;
            }
        }

        else if (msg.startsWith('!desafiar ') || msg.startsWith('!duelar ')) {
            if (!message.mentionedIds || message.mentionedIds.length === 0) {
                response = '❌ Marque alguém para desafiar!\nEx: !desafiar @pessoa';
            } else {
                const oponente = message.mentionedIds[0];
                
                if (oponente === userId) {
                    response = '❌ Você não pode desafiar a si mesmo!';
                } else {
                    const batalhaId = iniciarBatalha(userId, oponente);
                    const desafiantePoder = calcularPoder(userId);
                    const oponentePoder = calcularPoder(oponente);
                    
                    response = `⚔️ *DESAFIO DE BATALHA!* ⚔️

${(await message.getContact()).pushname} desafiou um oponente para um duelo!

📊 *Status:*
👤 Desafiante
  • Nível: ${torreXP[userId]?.nivel || 1}
  • Poder: ${desafiantePoder}
  • Vida: ${torreVida[userId] || 100}

👤 Oponente
  • Nível: ${torreXP[oponente]?.nivel || 1}
  • Poder: ${oponentePoder}
  • Vida: ${torreVida[oponente] || 100}

🎮 É a vez de ${(await message.getContact()).pushname}!
Digite *!atacar* para atacar!

⚠️ O perdedor perderá 30 de vida na Torre!`;
                }
            }
        }

        else if (msg === '!atacar' || msg === '!attack') {
            let batalhaId = null;
            
            for (let id in batalhasAtivas) {
                if (id.includes(userId)) {
                    batalhaId = id;
                    break;
                }
            }
            
            if (!batalhaId) {
                response = '❌ Você não está em nenhuma batalha!\nUse !desafiar @pessoa para iniciar um duelo.';
            } else {
                const resultado = atacarBatalha(batalhaId, userId);
                
                if (resultado.erro) {
                    response = `❌ ${resultado.erro}`;
                } else if (resultado.vencedor) {
                    response = `💥 *ATAQUE FATAL!* 💥

⚔️ Dano causado: ${resultado.dano}
💔 Oponente foi derrotado!

🏆 *VITÓRIA DE ${(await message.getContact()).pushname}!* 🏆

🎁 Recompensas:
${resultado.xp}
💰 +${resultado.recompensa} moedas

"A Torre reconhece sua força!"`;
                } else {
                    response = `⚔️ *COMBATE!* ⚔️

💥 Dano causado: ${resultado.dano}
💔 Vida do oponente: ${resultado.vidaDefensor}

🎮 Vez do próximo jogador!
Digite *!atacar* para atacar!`;
                }
            }
        }

        else if (msg === '!batalhas' || msg === '!duelos') {
            let batalhasUsuario = [];
            for (let id in batalhasAtivas) {
                if (id.includes(userId)) {
                    batalhasUsuario.push(id);
                }
            }
            
            if (batalhasUsuario.length === 0) {
                response = '❌ Você não está em nenhuma batalha ativa.';
            } else {
                response = '⚔️ *SUAS BATALHAS ATIVAS:*\n\n';
                for (let id of batalhasUsuario) {
                    const batalha = batalhasAtivas[id];
                    response += `🔸 Batalha ativa\n`;
                    response += `  Sua vez: ${batalha.turno === userId ? 'SIM ✅' : 'NÃO ⏳'}\n\n`;
                }
            }
        }

        else if (msg === '!apostar') {
            const saldo = torreMoney[userId] || 0;
            if (saldo < 10) {
                response = '❌ Você precisa de pelo menos 10 moedas para apostar.';
            } else {
                const ganhou = Math.random() < 0.5;
                const valor = Math.floor(Math.random() * 30) + 10;
                
                if (ganhou) {
                    torreMoney[userId] += valor;
                    const xpMsg = adicionarXP(userId, 5);
                    response = `🎲 Você apostou e *ganhou ${valor} moedas!*${xpMsg} 💰 Saldo: ${torreMoney[userId]}`;
                } else {
                    torreMoney[userId] = Math.max(0, torreMoney[userId] - valor);
                    response = `🎲 Você apostou e *perdeu ${valor} moedas...* 💰 Saldo: ${torreMoney[userId]}`;
                }
                salvarMoney();
            }
        }

        else if (msg.startsWith('!presentear ')) {
            if (!message.mentionedIds || message.mentionedIds.length === 0) {
                response = '❌ Marque alguém para enviar moedas. Ex: !presentear @pessoa 50';
            } else {
                const destinatario = message.mentionedIds[0];
                const partes = msg.split(' ').filter(p => p.trim() !== '');
                const valor = parseInt(partes[partes.length - 1]);
                
                if (isNaN(valor) || valor <= 0) {
                    response = '❌ Use: !presentear @pessoa valor (ex: !presentear @usuario 50)';
                } else {
                    torreMoney[userId] = torreMoney[userId] || 0;
                    torreMoney[destinatario] = torreMoney[destinatario] || 0;
                    
                    if (torreMoney[userId] < valor) {
                        response = '❌ Você não tem moedas suficientes.';
                    } else {
                        torreMoney[userId] -= valor;
                        torreMoney[destinatario] += valor;
                        salvarMoney();
                        response = `🎁 Você enviou ${valor} moedas com sucesso!`;
                    }
                }
            }
        }

        else if (msg.startsWith('!trocar ')) {
            if (!message.mentionedIds || message.mentionedIds.length === 0) {
                response = '❌ Use: !trocar @pessoa [seu_item] [item_dele]\nEx: !trocar @pessoa poção lanterna';
            } else {
                const partes = msg.split(' ').filter(p => !p.includes('@'));
                partes.shift();
                
                if (partes.length < 2) {
                    response = '❌ Especifique os itens da troca!\nEx: !trocar @pessoa poção lanterna';
                } else {
                    const destinatario = message.mentionedIds[0];
                    const itemOferecido = partes[0];
                    const itemPedido = partes[1];
                    
                    const invRemetente = torreInventario[userId] || [];
                    
                    if (!invRemetente.includes(itemOferecido)) {
                        response = `❌ Você não possui "${itemOferecido}" no inventário!`;
                    } else {
                        const trocaId = criarProposta(userId, destinatario, itemOferecido, itemPedido);
                        response = `🔄 Proposta de troca enviada!\n\n📦 Você oferece: ${itemOferecido}\n📦 Você pede: ${itemPedido}\n\nA pessoa deve aceitar com: !aceitartroca ${trocaId}`;
                    }
                }
            }
        }

        else if (msg.startsWith('!aceitartroca ')) {
            const trocaId = msg.replace('!aceitartroca ', '').trim();
            const resultado = aceitarTroca(trocaId);
            
            if (resultado.erro) {
                response = `❌ ${resultado.erro}`;
            } else {
                response = `✅ *TROCA REALIZADA COM SUCESSO!*\n\nOs itens foram trocados entre os inventários!`;
            }
        }

        else if (msg === '!minhatrocas' || msg === '!trocas') {
            let trocasPendentes = [];
            
            for (let trocaId in torreTrocas) {
                const troca = torreTrocas[trocaId];
                if (troca.destinatario === userId && troca.status === 'pendente') {
                    trocasPendentes.push({ id: trocaId, ...troca });
                }
            }
            
            if (trocasPendentes.length === 0) {
                response = '❌ Você não tem propostas de troca pendentes!';
            } else {
                let texto = '🔄 *PROPOSTAS DE TROCA PENDENTES:*\n\n';
                
                for (let troca of trocasPendentes) {
                    texto += `📦 ID: ${troca.id}\n`;
                    texto += `   Oferece: ${troca.itemOferecido}\n`;
                    texto += `   Pede: ${troca.itemPedido}\n\n`;
                }
                
                texto += 'Use: !aceitartroca [ID] para aceitar';
                response = texto;
            }
        }

        // COMANDO !BAN
        else if (msg.startsWith('!ban ') && message.from.includes('@g.us')) {
            if (!(await isAdmin(message))) {
                response = `❌ *Acesso Negado*\n\n"Na Torre, apenas os fortes têm autoridade. Você não é um administrador."`;
            } else {
                const chat = await message.getChat();
                const mention = message.mentionedIds[0];
                
                if (!mention) {
                    response = '❌ Marque alguém para banir.\n\n💡 Uso: !ban @usuario';
                } else {
                    try {
                        await chat.removeParticipants([mention]);
                        
                        response = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     🚫 𝐁𝐀𝐍𝐈𝐌𝐄𝐍𝐓𝐎 🚫
╰═•ೋ✧๑🥂๑✧ೋ•═╯

✅ Usuário removido do grupo!

"Na Torre, os fracos são eliminados. Esta pessoa falhou no teste."

⚖️ Ação executada por um Administrador`;
                        
                        console.log(`🚫 Usuário banido: ${mention}`);
                    } catch (error) {
                        console.error('Erro ao banir:', error);
                        response = '❌ Não foi possível banir este usuário. Verifique se tenho permissões de administrador.';
                    }
                }
            }
        }

        // COMANDO !PROMOVER
        else if (msg.startsWith('!promover ') && message.from.includes('@g.us')) {
            if (!(await isAdmin(message))) {
                response = `❌ *Acesso Negado*\n\n"Você não tem autoridade para promover ninguém na Torre."`;
            } else {
                const chat = await message.getChat();
                const mention = message.mentionedIds[0];
                
                if (!mention) {
                    response = '❌ Marque alguém para promover.\n\n💡 Uso: !promover @usuario';
                } else {
                    try {
                        await chat.promoteParticipants([mention]);
                        
                        response = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     👑 𝐏𝐑𝐎𝐌𝐎𝐂̧𝐀̃𝐎 👑
╰═•ೋ✧๑🥂๑✧ೋ•═╯

✅ Novo administrador promovido!

"Você subiu um andar na Torre. Use seu poder com sabedoria... ou não."

⚡ Agora você faz parte da elite!`;
                        
                        console.log(`👑 Usuário promovido: ${mention}`);
                    } catch (error) {
                        console.error('Erro ao promover:', error);
                        response = '❌ Não foi possível promover este usuário. Verifique se tenho permissões de administrador.';
                    }
                }
            }
        }

        // COMANDO !REBAIXAR
        else if (msg.startsWith('!rebaixar ') && message.from.includes('@g.us')) {
            if (!(await isAdmin(message))) {
                response = `❌ *Acesso Negado*\n\n"Apenas administradores podem rebaixar outros."`;
            } else {
                const chat = await message.getChat();
                const mention = message.mentionedIds[0];
                
                if (!mention) {
                    response = '❌ Marque alguém para rebaixar.\n\n💡 Uso: !rebaixar @usuario';
                } else {
                    try {
                        await chat.demoteParticipants([mention]);
                        
                        response = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     ⬇️ 𝐑𝐄𝐁𝐀𝐈𝐗𝐀𝐌𝐄𝐍𝐓𝐎 ⬇️
╰═•ೋ✧๑🥂๑✧ೋ•═╯

✅ Administrador rebaixado!

"Você caiu um andar na Torre. Nem todos merecem estar no topo."

💔 Privilégios de admin removidos`;
                        
                        console.log(`⬇️ Usuário rebaixado: ${mention}`);
                    } catch (error) {
                        console.error('Erro ao rebaixar:', error);
                        response = '❌ Não foi possível rebaixar este usuário.';
                    }
                }
            }
        }

        // COMANDO !ADVERTIR
        else if (msg.startsWith('!advertir ') && message.from.includes('@g.us')) {
            if (!(await isAdmin(message))) {
                response = `❌ *Acesso Negado*\n\n"Você não tem autoridade para advertir ninguém."`;
            } else {
                const mention = message.mentionedIds[0];
                
                if (!mention) {
                    response = '❌ Marque alguém para advertir.\n\n💡 Uso: !advertir @usuario [motivo]';
                } else {
                    const motivo = msg.split(' ').slice(2).join(' ') || 'Comportamento inadequado';
                    
                    response = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     ⚠️ 𝐀𝐃𝐕𝐄𝐑𝐓𝐄̂𝐍𝐂𝐈𝐀 ⚠️
╰═•ೋ✧๑🥂๑✧ೋ•═╯

⚠️ *VOCÊ FOI ADVERTIDO!*

📋 Motivo: ${motivo}

"Na Torre, erros têm consequências. Esta é sua chance de se redimir. Não haverá outra."

👁️ Administradores estão observando`;
                    
                    console.log(`⚠️ Advertência emitida para: ${mention} - Motivo: ${motivo}`);
                }
            }
        }

        // COMANDO !BANGHOST (MELHORADO COM CONFIRMAÇÃO)
        else if (msg === '!banghost' && message.from.includes('@g.us')) {
            if (!(await isAdmin(message))) {
                response = `❌ *Acesso Negado*\n\n"Este comando é poderoso demais para você."`;
            } else {
                response = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     ☠️ 𝐁𝐀𝐍 𝐆𝐇𝐎𝐒𝐓 ☠️
╰═•ೋ✧๑🥂๑✧ೋ•═╯

⚠️ *ATENÇÃO!* ⚠️

Este comando irá BANIR TODOS os não-administradores do grupo!

"Quer realmente limpar a Torre de todos os fracos?"

✅ Digite *!confirmarban* para confirmar
❌ Digite *!cancelar* para cancelar`;
                
                // Criar um timeout de confirmação
                global.banGhostPendente = {
                    userId: userId,
                    groupId: message.from,
                    timestamp: Date.now()
                };
            }
        }

        // COMANDO !CONFIRMARBAN
        else if (msg === '!confirmarban' && message.from.includes('@g.us')) {
            if (!(await isAdmin(message))) {
                response = '❌ Apenas administradores podem confirmar.';
            } else if (!global.banGhostPendente || global.banGhostPendente.userId !== userId) {
                response = '❌ Não há operação de ban pendente para você.';
            } else if (Date.now() - global.banGhostPendente.timestamp > 30000) {
                response = '⏰ Tempo de confirmação expirado (30 segundos). Use !banghost novamente.';
                delete global.banGhostPendente;
            } else {
                try {
                    const chat = await message.getChat();
                    const admins = chat.participants.filter(p => p.isAdmin).map(a => a.id._serialized);
                    
                    let banidos = 0;
                    for (const participant of chat.participants) {
                        if (!admins.includes(participant.id._serialized)) {
                            try {
                                await chat.removeParticipants([participant.id._serialized]);
                                banidos++;
                            } catch (e) {
                                console.error('Erro ao banir participante:', e);
                            }
                        }
                    }
                    
                    response = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     💀 𝐏𝐔𝐑𝐆𝐀 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀 💀
╰═•ೋ✧๑🥂๑✧ೋ•═╯

☠️ Ban Ghost executado!

📊 Total de banidos: ${banidos}

"A Torre foi purificada. Apenas os dignos permanecem."

⚖️ Que isto sirva de lição`;
                    
                    delete global.banGhostPendente;
                    console.log(`💀 Ban Ghost executado - ${banidos} usuários removidos`);
                } catch (error) {
                    console.error('Erro no ban ghost:', error);
                    response = '❌ Erro ao executar ban ghost.';
                }
            }
        }

        // COMANDO !CANCELAR
        else if (msg === '!cancelar' && message.from.includes('@g.us')) {
            if (global.banGhostPendente && global.banGhostPendente.userId === userId) {
                delete global.banGhostPendente;
                response = '✅ Operação cancelada.\n\n"Decisão sábia. Nem todo poder precisa ser usado."';
            } else {
                response = '❌ Não há operação pendente para cancelar.';
            }
        }

        // COMANDO !MUTE
        else if (msg === '!mute' && message.from.includes('@g.us')) {
            if (!(await isAdmin(message))) {
                response = `❌ *Acesso Negado*\n\n"Silenciar o grupo requer autoridade."`;
            } else {
                try {
                    const chat = await message.getChat();
                    await chat.setMessagesAdminsOnly(true);
                    
                    response = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     🔇 𝐆𝐑𝐔𝐏𝐎 𝐒𝐈𝐋𝐄𝐍𝐂𝐈𝐀𝐃𝐎 🔇
╰═•ೋ✧๑🥂๑✧ೋ•═╯

🔇 Grupo mutado!

"Silêncio. Apenas os administradores podem falar agora."

💡 Use *!desmute* para liberar`;
                    
                    console.log('🔇 Grupo mutado');
                } catch (error) {
                    console.error('Erro ao mutar:', error);
                    response = '❌ Não foi possível mutar o grupo.';
                }
            }
        }

        // COMANDO !DESMUTE
        else if (msg === '!desmute' && message.from.includes('@g.us')) {
            if (!(await isAdmin(message))) {
                response = `❌ *Acesso Negado*\n\n"Liberar o grupo requer autoridade."`;
            } else {
                try {
                    const chat = await message.getChat();
                    await chat.setMessagesAdminsOnly(false);
                    
                    response = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     🔊 𝐆𝐑𝐔𝐏𝐎 𝐋𝐈𝐁𝐄𝐑𝐀𝐃𝐎 🔊
╰═•ೋ✧๑🥂๑✧ೋ•═╯

🔊 Grupo desmutado!

"Podem falar novamente. Usem bem essa liberdade."

💬 Todos podem enviar mensagens`;
                    
                    console.log('🔊 Grupo desmutado');
                } catch (error) {
                    console.error('Erro ao desmutar:', error);
                    response = '❌ Não foi possível desmutar o grupo.';
                }
            }
        }

        // COMANDO !MARCAR (MELHORADO)
        else if (msg === '!marcar' && message.from.includes('@g.us')) {
            if (!(await isAdmin(message))) {
                response = `❌ *Acesso Negado*\n\n"Apenas administradores podem marcar todos."`;
            } else {
                try {
                    const chat = await message.getChat();
                    let text = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     📢 𝐂𝐇𝐀𝐌𝐀𝐃𝐀 𝐆𝐄𝐑𝐀𝐋 📢
╰═•ೋ✧๑🥂๑✧ೋ•═╯

"A Torre convoca todos os presentes!"\n\n`;
                    
                    let mentions = [];

                    for (let participant of chat.participants) {
                        const contact = await client.getContactById(participant.id._serialized);
                        mentions.push(contact);
                        text += `@${contact.number} `;
                    }

                    await chat.sendMessage(text, { mentions });
                    console.log(`📢 Marcação em massa - ${mentions.length} usuários`);
                    return;
                } catch (error) {
                    console.error('Erro ao marcar todos:', error);
                    response = '❌ Não foi possível marcar todos os membros.';
                }
            }
        }

        // COMANDO !ADMINS - VER LISTA DE ADMINS
        else if (msg === '!admins' && message.from.includes('@g.us')) {
            try {
                const chat = await message.getChat();
                const admins = chat.participants.filter(p => p.isAdmin);
                
                let texto = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     👑 𝐀𝐃𝐌𝐈𝐍𝐈𝐒𝐓𝐑𝐀𝐃𝐎𝐑𝐄𝐒 👑
╰═•ೋ✧๑🥂๑✧ೋ•═╯

"Os que governam este andar da Torre:"\n\n`;
                
                for (let i = 0; i < admins.length; i++) {
                    const numero = admins[i].id.user;
                    texto += `${i + 1}. +${numero}\n`;
                }
                
                texto += `\n👥 Total: ${admins.length} administradores`;
                response = texto;
            } catch (error) {
                console.error('Erro ao listar admins:', error);
                response = '❌ Não foi possível listar os administradores.';
            }
        }

        // COMANDO !INFOGRUPO - INFO DO GRUPO
        else if (msg === '!infogrupo' && message.from.includes('@g.us')) {
            try {
                const chat = await message.getChat();
                const criacao = new Date(chat.createdAt * 1000).toLocaleDateString('pt-BR');
                const admins = chat.participants.filter(p => p.isAdmin).length;
                
                response = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     📊 𝐈𝐍𝐅𝐎 𝐃𝐎 𝐆𝐑𝐔𝐏𝐎 📊
╰═•ೋ✧๑🥂๑✧ೋ•═╯

📌 *Nome:* ${chat.name}
📅 *Criado em:* ${criacao}
👥 *Membros:* ${chat.participants.length}
👑 *Admins:* ${admins}
🔒 *Apenas admins:* ${chat.groupMetadata.announce ? 'Sim' : 'Não'}

"Este é o andar ${chat.participants.length} da Torre"`;
            } catch (error) {
                console.error('Erro ao buscar info do grupo:', error);
                response = '❌ Não foi possível obter informações do grupo.';
            }
        }

        // COMANDO !STICKER - CRIAR FIGURINHA
        else if (msg === '!sticker' || msg === '!s' || msg === '!fig') {
            try {
                let mediaMessage;

                // Verifica se respondeu uma mensagem com mídia
                if (message.hasQuotedMsg) {
                    const quotedMsg = await message.getQuotedMessage();
                    if (!quotedMsg.hasMedia) {
                        response = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     ❌ 𝐄𝐑𝐑𝐎 ❌
╰═•ೋ✧๑🥂๑✧ೋ•═╯

"Você precisa responder uma imagem ou vídeo."

💡 Como usar:
• Responda uma foto/vídeo com !sticker
• Ou envie uma foto com a legenda !sticker`;
                    } else {
                        mediaMessage = quotedMsg;
                    }
                } 
                // Verifica se enviou mídia junto com o comando
                else if (message.hasMedia) {
                    mediaMessage = message;
                } 
                // Nenhuma mídia encontrada
                else {
                    response = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     📸 𝐂𝐎𝐌𝐎 𝐔𝐒𝐀𝐑 📸
╰═•ೋ✧๑🥂๑✧ೋ•═╯

"Para criar uma figurinha, você precisa enviar uma imagem."

💡 Opções:
╎⁑ۣۜۜ͜͡⭐ !sticker - Responda uma imagem
╎⁑ۣۜۜ͜͡⭐ !s - Atalho para sticker
╎⁑ۣۜۜ͜͡⭐ !stickernome [nome] - Com nome customizado
╎⁑ۣۜۜ͜͡⭐ !stickersem - Sem marca d'água

🎨 Formatos aceitos: JPG, PNG, GIF, MP4`;
                }

                if (mediaMessage) {
                    // Envia mensagem de processamento
                    await message.reply('⏳ Criando figurinha... Aguarde!\n\n"Até eu preciso de tempo para criar arte."');
                    
                    console.log('📥 Baixando mídia...');
                    const media = await mediaMessage.downloadMedia();
                    
                    if (!media) {
                        response = '❌ Não consegui baixar a mídia. Tente novamente.';
                        return;
                    }

                    const inputBuffer = Buffer.from(media.data, 'base64');
                    
                    // Verifica o tipo de mídia
                    const isVideo = media.mimetype.includes('video');
                    
                    console.log(`🎨 Processando ${isVideo ? 'vídeo' : 'imagem'}...`);

                    // SVG com marca d'água da Rachel
                    const svg = `<svg width="512" height="512">
                        <defs>
                            <filter id="shadow">
                                <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="black"/>
                            </filter>
                        </defs>
                        <text x="50%" y="96%" 
                              font-size="32" 
                              fill="white" 
                              stroke="black" 
                              stroke-width="2.5" 
                              text-anchor="middle" 
                              font-family="Arial, sans-serif"
                              font-weight="bold"
                              filter="url(#shadow)">
                            Rachel Bot ⭐
                        </text>
                    </svg>`;

                    let stickerBuffer;

                    if (isVideo) {
                        // Para vídeos, pega apenas o primeiro frame
                        stickerBuffer = await sharp(inputBuffer, { animated: false })
                            .resize(512, 512, { 
                                fit: 'contain',
                                background: { r: 0, g: 0, b: 0, alpha: 0 }
                            })
                            .composite([{ 
                                input: Buffer.from(svg), 
                                gravity: 'south'
                            }])
                            .webp({ quality: 100 })
                            .toBuffer();
                    } else {
                        // Para imagens
                        stickerBuffer = await sharp(inputBuffer)
                            .resize(512, 512, { 
                                fit: 'contain',
                                background: { r: 0, g: 0, b: 0, alpha: 0 }
                            })
                            .composite([{ 
                                input: Buffer.from(svg), 
                                gravity: 'south'
                            }])
                            .webp({ quality: 100 })
                            .toBuffer();
                    }

                    const stickerMedia = new MessageMedia(
                        'image/webp', 
                        stickerBuffer.toString('base64'), 
                        'sticker.webp'
                    );

                    console.log('📤 Enviando figurinha...');
                    await client.sendMessage(message.from, stickerMedia, { 
                        sendMediaAsSticker: true,
                        stickerName: 'Rachel Bot',
                        stickerAuthor: 'Torre de Deus'
                    });

                    console.log('✅ Figurinha criada e enviada com sucesso!');
                    
                    // Adiciona XP como recompensa por usar o bot
                    const xpMsg = adicionarXP(userId, 5);
                    
                    return;
                }
            } catch (err) {
                console.error('❌ Erro ao criar sticker:', err);
                console.error('Stack:', err.stack);
                
                response = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     ❌ 𝐄𝐑𝐑𝐎 ❌
╰═•ೋ✧๑🥂๑✧ೋ•═╯

"Algo deu errado ao criar a figurinha..."

🔍 Possíveis causas:
• Arquivo muito grande (máx 5MB)
• Formato não suportado
• Erro temporário do servidor

💡 Tente:
• Usar uma imagem menor
• Enviar em formato JPG ou PNG
• Tentar novamente em alguns segundos`;
            }
        }

        // COMANDO !STICKERNOME - COM NOME CUSTOMIZADO
        else if (msg.startsWith('!stickernome ') || msg.startsWith('!sn ')) {
            try {
                const nomeCustom = msg.replace('!stickernome ', '').replace('!sn ', '').trim();
                
                if (!nomeCustom) {
                    response = '❌ Use: !stickernome [seu texto]\n\nResponda uma imagem com este comando!';
                    return;
                }

                let mediaMessage;

                if (message.hasQuotedMsg) {
                    const quotedMsg = await message.getQuotedMessage();
                    if (quotedMsg.hasMedia) {
                        mediaMessage = quotedMsg;
                    }
                } else if (message.hasMedia) {
                    mediaMessage = message;
                }

                if (!mediaMessage) {
                    response = '❌ Responda uma imagem com o comando!\n\nEx: Responda uma foto com:\n!stickernome Seu Texto Aqui';
                    return;
                }

                await message.reply('⏳ Criando figurinha personalizada...');
                
                const media = await mediaMessage.downloadMedia();
                const inputBuffer = Buffer.from(media.data, 'base64');

                // SVG com texto customizado
                const svg = `<svg width="512" height="512">
                    <defs>
                        <filter id="shadow">
                            <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="black"/>
                        </filter>
                    </defs>
                    <text x="50%" y="96%" 
                          font-size="28" 
                          fill="white" 
                          stroke="black" 
                          stroke-width="2.5" 
                          text-anchor="middle" 
                          font-family="Arial, sans-serif"
                          font-weight="bold"
                          filter="url(#shadow)">
                        ${nomeCustom.substring(0, 30)}
                    </text>
                </svg>`;

                const stickerBuffer = await sharp(inputBuffer)
                    .resize(512, 512, { 
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    })
                    .composite([{ input: Buffer.from(svg), gravity: 'south' }])
                    .webp({ quality: 100 })
                    .toBuffer();

                const stickerMedia = new MessageMedia(
                    'image/webp', 
                    stickerBuffer.toString('base64'), 
                    'sticker.webp'
                );

                await client.sendMessage(message.from, stickerMedia, { 
                    sendMediaAsSticker: true,
                    stickerName: nomeCustom,
                    stickerAuthor: 'Rachel Bot'
                });

                console.log(`✅ Figurinha customizada criada: "${nomeCustom}"`);
                adicionarXP(userId, 8);
                return;

            } catch (err) {
                console.error('Erro ao criar sticker customizado:', err);
                response = '❌ Erro ao criar figurinha personalizada.';
            }
        }

        // COMANDO !STICKERSEM - SEM MARCA D'ÁGUA
        else if (msg === '!stickersem' || msg === '!ss') {
            try {
                let mediaMessage;

                if (message.hasQuotedMsg) {
                    const quotedMsg = await message.getQuotedMessage();
                    if (quotedMsg.hasMedia) {
                        mediaMessage = quotedMsg;
                    }
                } else if (message.hasMedia) {
                    mediaMessage = message;
                }

                if (!mediaMessage) {
                    response = '❌ Responda uma imagem com !stickersem\n\n"Sem marca d\'água, sem créditos..."';
                    return;
                }

                await message.reply('⏳ Criando figurinha limpa...');
                
                const media = await mediaMessage.downloadMedia();
                const inputBuffer = Buffer.from(media.data, 'base64');

                // Sem SVG, sem marca d'água
                const stickerBuffer = await sharp(inputBuffer)
                    .resize(512, 512, { 
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    })
                    .webp({ quality: 100 })
                    .toBuffer();

                const stickerMedia = new MessageMedia(
                    'image/webp', 
                    stickerBuffer.toString('base64'), 
                    'sticker.webp'
                );

                await client.sendMessage(message.from, stickerMedia, { 
                    sendMediaAsSticker: true,
                    stickerName: 'Sticker',
                    stickerAuthor: ''
                });

                console.log('✅ Figurinha sem marca criada');
                adicionarXP(userId, 3);
                return;

            } catch (err) {
                console.error('Erro ao criar sticker sem marca:', err);
                response = '❌ Erro ao criar figurinha.';
            }
        }

        // COMANDO !STICKERINFO - INFO SOBRE STICKERS
        else if (msg === '!stickerinfo' || msg === '!infofi') {
            response = `╭═•ೋ✧๑🥂๑✧ೋ•═╮
     🎨 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 🎨
╰═•ೋ✧๑🥂๑✧ೋ•═╯

"Criar figurinhas é uma arte na Torre."

📋 *COMANDOS DISPONÍVEIS:*

╎⁑ۣۜۜ͜͡⭐ !sticker ou !s
   → Cria figurinha com marca Rachel Bot

╎⁑ۣۜۜ͜͡⭐ !stickernome [texto]
   → Cria figurinha com seu texto
   → Ex: !stickernome Meu Nome

╎⁑ۣۜۜ͜͡⭐ !stickersem ou !ss
   → Cria figurinha sem marca d'água

📸 *FORMATOS ACEITOS:*
• Imagens: JPG, PNG, GIF
• Vídeos: MP4 (pega primeiro frame)
• Tamanho máximo: 5MB

💡 *COMO USAR:*
1. Envie uma imagem com a legenda !sticker
2. Ou responda uma imagem com !sticker

✨ Ganhe +5 XP a cada figurinha criada!`;
        }

        else {
            // Comando desconhecido - resposta com personalidade da Rachel
            const respostasDesconhecido = [
                `❌ *Comando desconhecido*\n\n"Você nem sabe usar comandos direito..."\n\n💡 Digite *!menu* para ver o que eu posso fazer.`,
                `❌ *Isso não existe*\n\n"Perder tempo com comandos errados não vai te levar ao topo da Torre."\n\n💡 Use *!menu* para ver os comandos.`,
                `❌ *Comando inválido*\n\n"Na Torre, um erro pode custar caro. Aprenda os comandos corretos."\n\n💡 Digite *!ajuda* para o menu completo.`,
                `❌ *Não reconheço isso*\n\n"Se você não sabe nem digitar um comando, como pretende subir a Torre?"\n\n💡 Veja *!menu* para ajuda.`
            ];
            
            response = respostasDesconhecido[Math.floor(Math.random() * respostasDesconhecido.length)];
            
            // Log do comando desconhecido para você melhorar o bot
            console.log(`⚠️ Comando desconhecido tentado: "${message.body}"`);
        }

        if (response) {
            console.log(`💬 Enviando resposta...`);
            await message.reply(response);
            console.log('✅ Resposta enviada!\n');
        }

    } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error);
        console.error('📍 Stack trace:', error.stack);
        console.error('📝 Mensagem que causou erro:', message.body);
        console.error('👤 Usuário:', userId);
        
        // Respostas de erro com personalidade da Rachel
        const respostasErro = [
            `❌ *Algo deu errado...*\n\n"Até eu, que quero ver as estrelas, tenho limites. Tente novamente."\n\n💡 Se persistir, contate o criador: *!criador*`,
            `❌ *Erro na Torre*\n\n"Parece que encontramos um obstáculo inesperado. A Torre é imprevisível..."\n\n🔄 Tente usar o comando novamente.`,
            `❌ *Falha no sistema*\n\n"Nem tudo funciona perfeitamente na Torre. Tente de novo em alguns segundos."\n\n💡 Comando: *!criador* para suporte.`,
            `❌ *Houston, temos um problema*\n\n"Algo não saiu como planejado... Mas não vou desistir. Você também não deveria."\n\n🔄 Tente novamente!`
        ];
        
        try {
            const respostaErro = respostasErro[Math.floor(Math.random() * respostasErro.length)];
            await message.reply(respostaErro);
            console.log('✅ Mensagem de erro enviada ao usuário');
        } catch (e) {
            console.error('❌❌ ERRO CRÍTICO - Não foi possível enviar mensagem de erro:', e);
            // Tenta uma última vez com mensagem simples
            try {
                await message.reply('❌ Erro crítico. Use !criador para reportar.');
            } catch (finalError) {
                console.error('❌❌❌ FALHA TOTAL NA COMUNICAÇÃO:', finalError);
            }
        }
    }
});

client.on('auth_failure', (msg) => {
    console.error('❌ FALHA NA AUTENTICAÇÃO:', msg);
    console.log('💡 Tente deletar a pasta .wwebjs_auth e escanear o QR novamente');
});

client.on('disconnected', (reason) => {
    console.log('⚠️  Bot desconectado. Motivo:', reason);
    console.log('🔄 Reiniciando...');
    client.initialize();
});

client.on('error', (error) => {
    console.error('❌ ERRO NO BOT:', error);
});

console.log('🔄 Inicializando conexão com WhatsApp...\n');
client.initialize().catch(err => {
    console.error('❌ Erro ao inicializar:', err);
});