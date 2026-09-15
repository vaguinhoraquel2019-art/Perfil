@echo off
title Publicando no GitHub...

echo.
echo  ================================================
echo        PARADISE PROFILE - PUBLICAR GITHUB
echo  ================================================
echo.

git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERRO] Git nao encontrado. Instale em https://git-scm.com
    pause
    exit /b 1
)

echo  [1/4] Configurando repositorio...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/vaguinhoraquel2019-art/Perfil.git
git branch -M main

echo  [2/4] Limpando historico antigo...
git checkout --orphan temp_branch >nul 2>&1
git add -A >nul 2>&1
git commit -m "update: site atualizado" >nul 2>&1
git branch -D main >nul 2>&1
git branch -m main >nul 2>&1

echo  [3/4] Enviando para o GitHub...
echo.
echo  Se pedir usuario: vaguinhoraquel2019-art
echo  Se pedir senha:   cole seu token ghp_...
echo.
git push origin main --force

if %errorlevel% equ 0 (
    echo.
    echo  ================================================
    echo   SUCESSO! Site publicado com historico limpo.
    echo   https://vaguinhoraquel2019-art.github.io/Perfil
    echo  ================================================
) else (
    echo.
    echo  [ERRO] Falha ao enviar. Verifique seu token.
)

echo.
pause
