[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [switch]$Destroy
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Push-Location $PSScriptRoot

try {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "[-] Docker not found." -ForegroundColor Red
        exit 1
    }

    if ($Destroy -and $PSCmdlet.ShouldProcess('Docker volumes', 'Remove containers + all data')) {
        Write-Host "[!] Destroying: removing containers, volumes, and all data..." -ForegroundColor Yellow
        docker compose down -v
    }
    else {
        Write-Host "[*] Stopping Docker stack (data preserved)..." -ForegroundColor Cyan
        docker compose down
    }

    if ($LASTEXITCODE -ne 0) {
        Write-Host "[-] docker compose down failed." -ForegroundColor Red
        exit $LASTEXITCODE
    }

    Write-Host "[+] Docker stack stopped." -ForegroundColor Green
}
finally {
    Pop-Location
}
