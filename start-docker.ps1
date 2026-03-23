[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [switch]$Build,
    [switch]$Reset
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Step  { param([string]$M) Write-Host "[*] $M" -ForegroundColor Cyan }
function Write-Ok    { param([string]$M) Write-Host "[+] $M" -ForegroundColor Green }
function Write-Warn  { param([string]$M) Write-Host "[!] $M" -ForegroundColor Yellow }
function Write-Err   { param([string]$M) Write-Host "[-] $M" -ForegroundColor Red }

function Test-DockerDaemon {
    docker info *> $null
    return ($LASTEXITCODE -eq 0)
}

function Test-PortAvailable {
    param([int]$Port)
    $listener = $null
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
        $listener.Start()
        return $true
    }
    catch { return $false }
    finally { if ($null -ne $listener) { $listener.Stop() } }
}

Push-Location $PSScriptRoot

try {
    Write-Host ""
    Write-Host "  Duly's House Booking System - Docker Launcher" -ForegroundColor White
    Write-Host "  ==============================================" -ForegroundColor DarkGray
    Write-Host ""

    # 1. Docker CLI
    Write-Step "Checking Docker CLI..."
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Err "Docker not found. Install Docker Desktop: https://docs.docker.com/desktop/install/windows-install/"
        exit 1
    }

    # 2. Docker Daemon
    Write-Step "Checking Docker daemon..."
    if (-not (Test-DockerDaemon)) {
        $exe = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
        if (Test-Path $exe) {
            Write-Warn "Docker daemon not ready. Starting Docker Desktop..."
            Start-Process -FilePath $exe | Out-Null
            for ($i = 1; $i -le 24; $i++) {
                if (Test-DockerDaemon) { break }
                Write-Step "Waiting for Docker daemon ($i/24)..."
                Start-Sleep -Seconds 5
            }
        }
        if (-not (Test-DockerDaemon)) {
            Write-Err "Docker daemon is not running. Open Docker Desktop and wait for 'Engine running'."
            exit 1
        }
    }
    Write-Ok "Docker daemon ready."

    # 3. Port check
    foreach ($port in @(80, 8000)) {
        if (-not (Test-PortAvailable -Port $port)) {
            Write-Err "Port $port is busy. Close the app using it and retry."
            Write-Host "      Check: netstat -ano | findstr :$port" -ForegroundColor DarkGray
            exit 1
        }
    }
    Write-Ok "Ports 80 and 8000 available."

    # 4. Reset if requested
    if ($Reset -and $PSCmdlet.ShouldProcess('Docker volumes', 'Remove all data')) {
        Write-Warn "Resetting: removing containers and volumes..."
        docker compose down -v 2>$null
        Write-Ok "Clean slate ready."
    }

    # 5. Start
    $composeArgs = @('compose', 'up', '-d')
    if ($Build) { $composeArgs += '--build' }

    Write-Step "Starting Docker stack$(if ($Build) { ' (rebuilding images)' })..."
    & docker @composeArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Err "docker compose up failed."
        exit $LASTEXITCODE
    }

    Write-Host ""
    Write-Ok "All services started!"
    Write-Host ""
    Write-Host "  Frontend:  http://localhost"        -ForegroundColor White
    Write-Host "  API:       http://localhost:8000/api" -ForegroundColor White
    Write-Host ""
    Write-Host "  Accounts:  admin@dulyshouse.vn / password" -ForegroundColor DarkGray
    Write-Host "             guest@dulyshouse.vn / password" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "  Commands:" -ForegroundColor DarkGray
    Write-Host "    docker compose ps              Check status" -ForegroundColor DarkGray
    Write-Host "    docker compose logs -f backend View backend logs" -ForegroundColor DarkGray
    Write-Host "    .\stop-docker.ps1              Stop all services" -ForegroundColor DarkGray
    Write-Host ""
}
finally {
    Pop-Location
}
