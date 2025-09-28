#!/bin/bash

# ==========================================
# 🌟 RACHEL BOT - TOWER OF GOD 🌟
# WhatsApp Bot com tema da Rachel
# "I just want to see the stars..."
# ==========================================

# Cores para output estilizado
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Banner da Rachel
print_rachel_banner() {
    echo -e "${PURPLE}"
    echo "  ██████╗  █████╗  ██████╗██╗  ██╗███████╗██╗     "
    echo "  ██╔══██╗██╔══██╗██╔════╝██║  ██║██╔════╝██║     "
    echo "  ██████╔╝███████║██║     ███████║█████╗  ██║     "
    echo "  ██╔══██╗██╔══██║██║     ██╔══██║██╔══╝  ██║     "
    echo "  ██║  ██║██║  ██║╚██████╗██║  ██║███████╗███████╗"
    echo "  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝"
    echo -e "${CYAN}           🌟 Tower of God WhatsApp Bot 🌟${NC}"
    echo -e "${YELLOW}        \"Eu só quero ver as estrelas...\"${NC}"
    echo ""
}

# Função para logging estilizado
log_message() {
    local type=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $type in
        "INFO")
            echo -e "${GREEN}[${timestamp}] ℹ️  ${message}${NC}"
            ;;
        "WARN")
            echo -e "${YELLOW}[${timestamp}] ⚠️  ${message}${NC}"
            ;;
        "ERROR")
            echo -e "${RED}[${timestamp}] ❌ ${message}${NC}"
            ;;
        "RACHEL")
            echo -e "${PURPLE}[${timestamp}] 🌟 Rachel: ${message}${NC}"
            ;;
    esac
}

# Verificar dependências
check_dependencies() {
    log_message "INFO" "Verificando dependências da Torre..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        log_message "ERROR" "Node.js não encontrado! Rachel precisa dele para subir a Torre."
        exit 1
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        log_message "ERROR" "npm não encontrado! Como Rachel vai gerenciar os pacotes?"
        exit 1
    fi
    
    # Verificar se o arquivo principal existe
    if [ ! -f "index.js" ] && [ ! -f "app.js" ] && [ ! -f "bot.js" ]; then
        log_message "ERROR" "Arquivo principal do bot não encontrado!"
        log_message "INFO" "Procurando por: index.js, app.js, ou bot.js"
        exit 1
    fi
    
    log_message "INFO" "Todas as dependências verificadas! ✓"
}

# Instalar dependências se necessário
install_dependencies() {
    if [ ! -d "node_modules" ]; then
        log_message "RACHEL" "Instalando poderes necessários para a jornada..."
        npm install
        
        if [ $? -ne 0 ]; then
            log_message "ERROR" "Falha ao instalar dependências!"
            exit 1
        fi
    fi
}

# Configurações do ambiente
setup_environment() {
    log_message "INFO" "Configurando ambiente da Rachel..."
    
    # Criar diretório de logs se não existir
    mkdir -p logs
    mkdir -p sessions
    mkdir -p media
    
    # Definir variáveis de ambiente padrão
    export BOT_NAME="Rachel Bot"
    export BOT_PREFIX="!"
    export BOT_OWNER="Você"
    export TZ="America/Sao_Paulo"
    
    # Verificar arquivo .env
    if [ ! -f ".env" ]; then
        log_message "WARN" "Arquivo .env não encontrado! Criando um modelo..."
        cat > .env << EOF
# ============================================
# CONFIGURAÇÕES DO RACHEL BOT - TOWER OF GOD
# ============================================

BOT_NAME=Rachel Bot
BOT_PREFIX=!
BOT_OWNER=Seu Nome Aqui
ADMIN_NUMBERS=5511999999999

# Mensagens temáticas da Rachel
WELCOME_MESSAGE=Bem-vindo à Torre! Eu sou Rachel, sua guia nesta jornada.
HELP_MESSAGE=Como posso ajudá-lo a subir a Torre hoje?

# Configurações técnicas
SESSION_NAME=rachel_session
AUTO_REPLY=true
LOG_LEVEL=info
EOF
        log_message "RACHEL" "Arquivo .env criado! Configure-o antes de continuar."
    fi
    
    log_message "INFO" "Ambiente configurado! ✓"
}

# Função de limpeza
cleanup() {
    log_message "RACHEL" "Rachel está descansando... Até logo!"
    exit 0
}

# Capturar sinais de interrupção
trap cleanup SIGINT SIGTERM

# Função principal para iniciar o bot
start_bot() {
    local main_file=""
    
    # Determinar arquivo principal
    if [ -f "index.js" ]; then
        main_file="index.js"
    elif [ -f "app.js" ]; then
        main_file="app.js"
    elif [ -f "bot.js" ]; then
        main_file="bot.js"
    fi
    
    log_message "RACHEL" "Subindo a Torre... Iniciando jornada!"
    log_message "INFO" "Executando: node $main_file"
    
    # Iniciar o bot com restart automático
    while true; do
        node $main_file
        
        local exit_code=$?
        
        if [ $exit_code -eq 0 ]; then
            log_message "RACHEL" "Bot encerrado normalmente."
            break
        else
            log_message "ERROR" "Bot crashou com código $exit_code"
            log_message "RACHEL" "Rachel não desiste! Reiniciando em 5 segundos..."
            sleep 5
        fi
    done
}

# Menu interativo
show_menu() {
    echo -e "${CYAN}===========================================${NC}"
    echo -e "${WHITE}Escolha uma opção:${NC}"
    echo -e "${GREEN}1) 🚀 Iniciar Rachel Bot${NC}"
    echo -e "${YELLOW}2) 📦 Instalar dependências${NC}"
    echo -e "${BLUE}3) 🔧 Configurar ambiente${NC}"
    echo -e "${PURPLE}4) 📋 Verificar status${NC}"
    echo -e "${RED}5) 🛑 Sair${NC}"
    echo -e "${CYAN}===========================================${NC}"
    echo -n "Digite sua escolha: "
}

# Função principal
main() {
    # Limpar tela
    clear
    
    # Mostrar banner
    print_rachel_banner
    
    # Verificar argumentos de linha de comando
    if [ "$1" = "start" ] || [ "$1" = "-s" ]; then
        check_dependencies
        setup_environment
        install_dependencies
        start_bot
        return
    fi
    
    if [ "$1" = "install" ] || [ "$1" = "-i" ]; then
        install_dependencies
        return
    fi
    
    # Menu interativo se não houver argumentos
    while true; do
        show_menu
        read -r choice
        
        case $choice in
            1)
                clear
                print_rachel_banner
                check_dependencies
                setup_environment
                install_dependencies
                start_bot
                break
                ;;
            2)
                install_dependencies
                log_message "RACHEL" "Dependências instaladas!"
                echo ""
                ;;
            3)
                setup_environment
                log_message "RACHEL" "Ambiente configurado!"
                echo ""
                ;;
            4)
                check_dependencies
                log_message "RACHEL" "Sistema verificado!"
                echo ""
                ;;
            5)
                cleanup
                ;;
            *)
                log_message "ERROR" "Opção inválida! Rachel não entende isso..."
                echo ""
                ;;
        esac
    done
}

# Verificar se o script está sendo executado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
