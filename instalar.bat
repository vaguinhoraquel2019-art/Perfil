@echo off
chcp 65001 >nul
title Paradise Profile - Instalador

echo.
echo  ================================================
echo        PARADISE PROFILE - INSTALADOR
echo  ================================================
echo.

:: -- Verifica se Git esta instalado
echo  [1/5] Verificando Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  [!] Git nao encontrado.
    echo      Baixe em: https://git-scm.com/download/win
    echo      Instale e execute este arquivo novamente.
    echo.
    pause
    exit /b 1
)
echo  [OK] Git encontrado.

:: -- Verifica se ja e um repositorio Git
echo  [2/5] Verificando repositorio Git...
git rev-parse --is-inside-work-tree >nul 2>&1
if %errorlevel% neq 0 (
    echo  Inicializando repositorio Git...
    git init
    if %errorlevel% neq 0 (
        echo  [ERRO] Nao foi possivel inicializar o repositorio.
        pause
        exit /b 1
    )
    echo  [OK] Repositorio inicializado.
) else (
    echo  [OK] Repositorio ja existe.
)

:: -- Verifica Node.js (opcional)
echo  [3/5] Verificando Node.js (opcional)...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [--] Node.js nao encontrado - nao e obrigatorio.
    echo       O site e puro HTML/CSS/JS, nenhum build necessario.
) else (
    echo  [OK] Node.js encontrado.
)

:: -- Cria .gitignore se nao existir
echo  [4/5] Configurando .gitignore...
if not exist ".gitignore" (
    (
        echo # Sistema operacional
        echo .DS_Store
        echo Thumbs.db
        echo desktop.ini
        echo.
        echo # Editores
        echo .vscode/
        echo .idea/
        echo.
        echo # Node
        echo node_modules/
        echo npm-debug.log
        echo.
        echo # Variaveis de ambiente
        echo .env
        echo .env.local
    ) > .gitignore
    echo  [OK] .gitignore criado.
) else (
    echo  [OK] .gitignore ja existe.
)

:: -- Abre o site no navegador
echo  [5/5] Abrindo o site no navegador...
start "" "index.html"
echo  [OK] Site aberto.

echo.
echo  ================================================
echo   TUDO PRONTO!
echo  ------------------------------------------------
echo   Abra index.html para ver seu perfil
echo   Abra admin.html para configurar
echo   Execute publicar.bat para postar no GitHub
echo  ================================================
echo.
pause
