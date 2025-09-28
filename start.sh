#!/bin/bash
clear

# Banner Rachel Tower of God
echo -e "\e[35m"
echo "╔════════════════════════════════════════╗"
echo "║          🌌 Rachel - Tower of God       ║"
echo "║          Iniciando o Bot WhatsApp       ║"
echo "╚════════════════════════════════════════╝"
echo -e "\e[0m"

# Checar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "\e[33m📦 Instalando dependências...\e[0m"
    npm install
fi

# Iniciar bot
echo -e "\e[32m🚀 Subindo Rachel Bot...\e[0m"
node conexao.js
