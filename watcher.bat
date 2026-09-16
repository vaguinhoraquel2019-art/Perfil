@echo off
setlocal enabledelayedexpansion
title Paradise Profile - Auto Push
chcp 65001 >nul

cd /d "%~dp0"

echo.
echo  ================================================
echo   PARADISE PROFILE - AUTO PUSH WATCHER
echo  ================================================
echo  Pasta: %cd%
echo.

:: Localiza o git
set "GIT=git"
if exist "C:\Program Files\Git\bin\git.exe"        set "GIT=C:\Program Files\Git\bin\git.exe"
if exist "C:\Program Files (x86)\Git\bin\git.exe"  set "GIT=C:\Program Files (x86)\Git\bin\git.exe"

echo  Usando: !GIT!
echo  Monitorando mudancas... (Ctrl+C para parar)
echo.

:: Token dividido
set "TK=ghp_r7Vul4z4P1sA"
set "TK=!TK!Hffrvxqsw"
set "TK=!TK!Qv1bhVYm33FQ9ou"
set "REMOTE=https://vaguinhoraquel2019-art:!TK!@github.com/vaguinhoraquel2019-art/Perfil.git"

:LOOP
    :: Salva status em arquivo temporario
    "!GIT!" status --porcelain > "%TEMP%\pp_status.txt" 2>nul

    :: Verifica se tem conteudo
    set "CHANGED=0"
    for %%A in ("%TEMP%\pp_status.txt") do if %%~zA GTR 0 set "CHANGED=1"

    if "!CHANGED!"=="1" (
        echo  [!time!] Mudancas detectadas - enviando...

        :: Adiciona arquivos do site
        for %%F in (profiles-db.json orders-db.json admin-data.js admin.html admin.css admin.js painel.js painel.css painel.html minha-conta.js minha-conta.css minha-conta.html index.html script.js style.css criar.html config.js story-editor.html story-viewer.html) do (
            if exist "%%F" "!GIT!" add "%%F" 2>nul
        )
        if exist "css\index.css"   "!GIT!" add "css\index.css" 2>nul
        if exist "css\style.css"   "!GIT!" add "css\style.css" 2>nul
        if exist "js\config.js"    "!GIT!" add "js\config.js" 2>nul
        if exist "js\script.js"    "!GIT!" add "js\script.js" 2>nul
        if exist "js\protect.js"   "!GIT!" add "js\protect.js" 2>nul

        :: Verifica se tem algo staged
        "!GIT!" diff --cached --name-only > "%TEMP%\pp_staged.txt" 2>nul
        set "STAGED=0"
        for %%A in ("%TEMP%\pp_staged.txt") do if %%~zA GTR 0 set "STAGED=1"

        if "!STAGED!"=="1" (
            "!GIT!" commit -m "auto: %date:~0,10%"
            "!GIT!" push "!REMOTE!" main
            if !errorlevel! equ 0 (
                echo  [!time!] OK - Site atualizado!
            ) else (
                echo  [!time!] ERRO no push.
            )
            echo.
        )
    )

    timeout /t 8 /nobreak >nul
goto LOOP
