@echo off
chcp 65001 >nul
title Forcando push...

echo.
echo  Configurando remote...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/vaguinhoraquel2019-art/Perfil.git

echo  Adicionando TODOS os arquivos...
git add -A --force

echo  Criando commit...
git commit -m "update: site atualizado" >nul 2>&1

echo  Definindo branch main...
git branch -M main

echo  Enviando para o GitHub...
echo  (vai pedir usuario e token se ainda nao estiver salvo)
echo.
git push -u origin main --force

if %errorlevel% equ 0 (
    echo.
    echo  SUCESSO!
    echo  https://vaguinhoraquel2019-art.github.io/Perfil
) else (
    echo.
    echo  ERRO ao enviar.
)
echo.
pause
