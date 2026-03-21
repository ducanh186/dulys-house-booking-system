[CmdletBinding(SupportsShouldProcess = $true)]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Push-Location $PSScriptRoot

try {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "[ERR]  Docker command not found." -ForegroundColor Red
        exit 1
    }

    if ($PSCmdlet.ShouldProcess('Docker Compose', 'docker compose down')) {
        Write-Host "[INFO] Stopping Docker stack..."
        docker compose down
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERR]  docker compose down failed." -ForegroundColor Red
            exit $LASTEXITCODE
        }
    }

    Write-Host "[OK]   Docker stack stopped." -ForegroundColor Green
}
finally {
    Pop-Location
}
