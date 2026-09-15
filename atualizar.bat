@echo off
title Atualizando GitHub...

echo.
echo  ================================================
echo        PARADISE PROFILE - ATUALIZAR GITHUB
echo  ================================================
echo.

git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERRO] Git nao encontrado.
    pause
    exit /b 1
)

echo  [1/3] Adicionando arquivos...
git add -A

git diff --cached --quiet >nul 2>&1
if %errorlevel% equ 0 (
    echo  Nenhuma mudanca. O site ja esta atualizado!
    echo.
    pause
    exit /b 0
)

echo  [2/3] Criando commit...
git commit -m "update: site atualizado"

echo  [3/3] Enviando para o GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo  ================================================
    echo   SITE ATUALIZADO COM SUCESSO!
    echo   https://vaguinhoraquel2019-art.github.io/Perfil
    echo  ================================================
) else (
    echo.
    echo  [ERRO] Falha ao enviar. Verifique seu token.
)

echo.
pause