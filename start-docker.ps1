[CmdletBinding(SupportsShouldProcess = $true)]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message"
}

function Write-Ok {
    param([string]$Message)
    Write-Host "[OK]   $Message" -ForegroundColor Green
}

function Write-WarnMsg {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-ErrMsg {
    param([string]$Message)
    Write-Host "[ERR]  $Message" -ForegroundColor Red
}

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
    catch {
        return $false
    }
    finally {
        if ($null -ne $listener) {
            $listener.Stop()
        }
    }
}

Push-Location $PSScriptRoot

try {
    Write-Info "Checking Docker CLI..."
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-ErrMsg "Docker command not found. Please install Docker Desktop first."
        exit 1
    }

    Write-Info "Checking Docker daemon..."
    if (-not (Test-DockerDaemon)) {
        $dockerDesktopExe = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
        if (Test-Path $dockerDesktopExe) {
            if ($PSCmdlet.ShouldProcess('Docker Desktop', "Start from $dockerDesktopExe")) {
                Write-WarnMsg "Docker daemon is not ready. Launching Docker Desktop..."
                Start-Process -FilePath $dockerDesktopExe | Out-Null
            }

            $maxRetries = 24
            $retrySeconds = 5
            for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
                if (Test-DockerDaemon) {
                    break
                }
                Write-Info "Waiting for Docker daemon ($attempt/$maxRetries)..."
                Start-Sleep -Seconds $retrySeconds
            }
        }

        if (-not (Test-DockerDaemon)) {
            Write-ErrMsg "Docker daemon is not running. Open Docker Desktop, wait for 'Engine running', then run this script again."
            exit 1
        }
    }
    Write-Ok "Docker daemon is ready."

    foreach ($port in @(80, 8000)) {
        if (-not (Test-PortAvailable -Port $port)) {
            Write-ErrMsg "Port $port is already in use."
            Write-Host "      Close the app using this port and run again."
            Write-Host "      Quick check: netstat -ano | findstr :$port"
            exit 1
        }
    }
    Write-Ok "Ports 80 and 8000 are available."

    if ($PSCmdlet.ShouldProcess('Docker Compose', 'docker compose up -d')) {
        Write-Info "Starting Docker stack..."
        docker compose up -d
        if ($LASTEXITCODE -ne 0) {
            Write-ErrMsg "docker compose up -d failed."
            exit $LASTEXITCODE
        }
    }

    Write-Ok "Startup completed."
    Write-Host ""
    Write-Host "Quick access:"
    Write-Host "- Frontend: http://localhost"
    Write-Host "- Backend API: http://localhost:8000/api"
    Write-Host ""
    Write-Host "Check status: docker compose ps"
}
finally {
    Pop-Location
}
