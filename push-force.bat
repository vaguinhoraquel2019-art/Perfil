@echo off
title Enviando para o GitHub (force)...
chcp 65001 >nul

echo.
echo  ================================================
echo   PARADISE PROFILE - ENVIAR (SUBSTITUIR COMMIT)
echo  ================================================
echo.
echo  Cole seu token GitHub (ghp_...) e pressione Enter:
echo.

cd /d "%~dp0"

set /p TOKEN="Token: "

git push --force https://vaguinhoraquel2019-art:%TOKEN%@github.com/vaguinhoraquel2019-art/Perfil.git main

if %errorlevel% equ 0 (
    echo.
    echo  ================================================
    echo   SUCESSO! Site atualizado.
    echo   https://vaguinhoraquel2019-art.github.io/Perfil
    echo  ================================================
) else (
    echo.
    echo  [ERRO] Falha ao enviar.
)

echo.
pause
