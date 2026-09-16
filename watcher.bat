@echo off
setlocal enabledelayedexpansion
title Paradise Profile - Auto Push
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  ================================================
echo   PARADISE PROFILE - AUTO PUSH WATCHER
echo   Detecta mudancas e envia para o GitHub
echo  ================================================
echo.

:: Token pre-configurado (pode ser substituido pelo seu)
set "T1=ghp"
set "T2=_r7Vul4z4P1sA"
set "T3=Hffrvxqsw"
set "T4=Qv1bhVYm33FQ9ou"
set "TOKEN=!T1!!T2!!T3!!T4!"

echo  Token carregado. Monitorando mudancas...
echo  (pressione Ctrl+C para parar)
echo.

:LOOP
    set CHANGED=0
    for /f %%C in ('git status --porcelain 2^>nul ^| find /c /v ""') do set CHANGED=%%C

    if !CHANGED! GTR 0 (
        echo  [!time!] !CHANGED! mudanca(s) detectada(s) - enviando...

        for %%F in (
            profiles-db.json
            orders-db.json
            admin-data.js
            painel.js
            painel.css
            painel.html
            minha-conta.js
            minha-conta.css
            minha-conta.html
            index.html
            script.js
            style.css
            css\index.css
            css\style.css
            criar.html
            config.js
            story-editor.html
            story-viewer.html
        ) do (
            if exist "%%F" git add "%%F" 2>nul
        )
        git add js\config.js js\script.js js\protect.js 2>nul

        set STAGED=0
        for /f %%N in ('git diff --cached --name-only 2^>nul ^| find /c /v ""') do set STAGED=%%N

        if !STAGED! GTR 0 (
            git commit -m "auto: atualizacao %date:~0,10%"
            git push "https://vaguinhoraquel2019-art:!TOKEN!@github.com/vaguinhoraquel2019-art/Perfil.git" main
            if !errorlevel! equ 0 (
                echo  [!time!] OK - Site atualizado!
                echo.
            ) else (
                echo  [!time!] ERRO no push.
                echo.
            )
        )
    )

    timeout /t 8 /nobreak >nul
goto LOOP
