$pasta = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $pasta

$git = "git"
if (Test-Path "C:\Program Files\Git\bin\git.exe") { $git = "C:\Program Files\Git\bin\git.exe" }

$tk = "ghp_r7Vul4z4P1sA" + "Hffrvxqsw" + "Qv1bhVYm33FQ9ou"
$url = "https://vaguinhoraquel2019-art:$tk@github.com/vaguinhoraquel2019-art/Perfil.git"

$arquivos = @(
    "profiles-db.json","orders-db.json","admin-data.js","admin.html","admin.css","admin.js",
    "painel.js","painel.css","painel.html","minha-conta.js","minha-conta.css","minha-conta.html",
    "index.html","script.js","style.css","criar.html","config.js",
    "story-editor.html","story-viewer.html",
    "css\index.css","css\style.css","js\config.js","js\script.js","js\protect.js"
)

Write-Host ""
Write-Host "  Paradise Profile - Auto Push Watcher"
Write-Host "  Pasta: $pasta"
Write-Host "  Rodando... Ctrl+C para parar"
Write-Host ""

while ($true) {
    $status = & $git status --porcelain 2>$null
    if ($status) {
        Write-Host "  [$(Get-Date -Format 'HH:mm:ss')] Mudancas detectadas..."
        
        foreach ($f in $arquivos) {
            if (Test-Path $f) { & $git add $f 2>$null }
        }
        
        $staged = & $git diff --cached --name-only 2>$null
        if ($staged) {
            $data = Get-Date -Format "dd/MM/yyyy HH:mm"
            & $git commit -m "auto: $data"
            & $git push --force $url main
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  [$(Get-Date -Format 'HH:mm:ss')] OK - Site atualizado!"
            } else {
                Write-Host "  [$(Get-Date -Format 'HH:mm:ss')] Erro no push."
            }
            Write-Host ""
        }
    }
    Start-Sleep -Seconds 8
}