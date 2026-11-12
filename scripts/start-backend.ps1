# Loads backend/.env (if present) into the process environment, then starts Spring Boot.
# Usage: ./scripts/start-backend.ps1            (MySQL)
#        ./scripts/start-backend.ps1 -H2        (free file database, no MySQL needed)
param([switch]$H2)
$root = Split-Path $PSScriptRoot -Parent
$envFile = Join-Path $root 'backend\.env'
if (Test-Path $envFile) {
  Get-Content $envFile | Where-Object { $_ -match '^\s*[^#\s][^=]*=' } | ForEach-Object {
    $k, $v = $_ -split '=', 2; Set-Item -Path "Env:$($k.Trim())" -Value $v.Trim()
  }
}
if ($H2) { $env:SPRING_PROFILES_ACTIVE = 'h2' }
Set-Location (Join-Path $root 'backend')
./mvnw.cmd spring-boot:run