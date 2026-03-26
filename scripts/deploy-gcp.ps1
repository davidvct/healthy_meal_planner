[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectId,

    [string]$Region = "asia-southeast1",

    [string]$ServiceName = "meal-planner-api",

    [string]$SourcePath = ".",

    [string]$EnvVarsFile = "",

    [string]$CloudSqlInstance = "",

    [int]$MinInstances = 0,

    [int]$MaxInstances = 10,

    [int]$Concurrency = 80,

    [string]$Memory = "512Mi",

    [string]$Cpu = "1",

    [switch]$RequireInvokerAuth
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$propertiesPath = Join-Path $repoRoot "application.properties"

function Get-Properties {
    param([string]$Path)

    $result = @{}
    if (-not (Test-Path $Path)) {
        return $result
    }

    foreach ($line in Get-Content $Path) {
        $trimmed = $line.Trim()
        if (-not $trimmed -or $trimmed.StartsWith("#") -or -not $trimmed.Contains("=")) {
            continue
        }

        $parts = $trimmed.Split("=", 2)
        $key = $parts[0].Trim()
        $value = $parts[1].Trim()
        if ($key) {
            $result[$key] = $value
        }
    }

    return $result
}

function Get-Setting {
    param(
        [string]$Key,
        [hashtable]$Properties
    )

    $envValue = [Environment]::GetEnvironmentVariable($Key)
    if (-not [string]::IsNullOrWhiteSpace($envValue)) {
        return $envValue
    }

    if ($Properties.ContainsKey($Key) -and -not [string]::IsNullOrWhiteSpace($Properties[$Key])) {
        return $Properties[$Key]
    }

    return $null
}

function Get-CloudSqlInstanceFromDatabaseUrl {
    param([string]$DatabaseUrl)

    if ([string]::IsNullOrWhiteSpace($DatabaseUrl)) {
        return $null
    }

    $match = [regex]::Match($DatabaseUrl, "host=/cloudsql/([^&]+)")
    if ($match.Success) {
        return $match.Groups[1].Value
    }

    return $null
}

function Convert-EnvVarsFileToJson {
    param([string]$Path)

    $raw = Get-Content -Path $Path -Raw
    $envMap = [ordered]@{}

    foreach ($line in ($raw -split "`r?`n")) {
        $trimmed = $line.Trim()
        if (-not $trimmed -or $trimmed.StartsWith("#")) {
            continue
        }

        if ($trimmed.Contains("=")) {
            $parts = $trimmed.Split("=", 2)
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
        }
        elseif ($trimmed.Contains(":")) {
            $parts = $trimmed.Split(":", 2)
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
        }
        else {
            throw "Unsupported env vars file line: $trimmed"
        }

        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        if (-not $key) {
            throw "Invalid env vars file entry: $trimmed"
        }

        $envMap[$key] = $value
    }

    if ($envMap.Count -eq 0) {
        throw "Env vars file $Path did not contain any parseable entries."
    }

    $tempJson = Join-Path ([System.IO.Path]::GetTempPath()) ("cloudrun-env-" + [System.Guid]::NewGuid().ToString("N") + ".json")
    $envMap | ConvertTo-Json -Compress | Set-Content -Path $tempJson -Encoding UTF8
    return $tempJson
}

if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    throw "gcloud CLI is required but was not found in PATH."
}

$properties = Get-Properties -Path $propertiesPath
$databaseUrl = Get-Setting -Key "DATABASE_URL" -Properties $properties

if ([string]::IsNullOrWhiteSpace($CloudSqlInstance)) {
    $CloudSqlInstance = Get-CloudSqlInstanceFromDatabaseUrl -DatabaseUrl $databaseUrl
}

$resolvedSourcePath = Resolve-Path -Path (Join-Path $repoRoot $SourcePath)
$normalizedEnvFile = $null

Write-Host "Deploying $ServiceName to Cloud Run in project $ProjectId ($Region)..."
if ($CloudSqlInstance) {
    Write-Host "Using Cloud SQL instance: $CloudSqlInstance"
}
if ($EnvVarsFile) {
    Write-Host "Using env vars file: $EnvVarsFile"
}

& gcloud config set project $ProjectId | Out-Null

$deployArgs = @(
    "run",
    "deploy",
    $ServiceName,
    "--source",
    $resolvedSourcePath.Path,
    "--region",
    $Region,
    "--platform",
    "managed",
    "--port",
    "8080",
    "--cpu",
    $Cpu,
    "--memory",
    $Memory,
    "--concurrency",
    "$Concurrency",
    "--min-instances",
    "$MinInstances",
    "--max-instances",
    "$MaxInstances"
)

if ($RequireInvokerAuth) {
    $deployArgs += "--no-allow-unauthenticated"
}
else {
    $deployArgs += "--allow-unauthenticated"
}

if (-not [string]::IsNullOrWhiteSpace($CloudSqlInstance)) {
    $deployArgs += @("--add-cloudsql-instances", $CloudSqlInstance)
}

try {
    if (-not [string]::IsNullOrWhiteSpace($EnvVarsFile)) {
        $resolvedEnvFile = Resolve-Path -Path (Join-Path $repoRoot $EnvVarsFile)
        $normalizedEnvFile = Convert-EnvVarsFileToJson -Path $resolvedEnvFile.Path
        $deployArgs += @("--env-vars-file", $normalizedEnvFile)
    }

    & gcloud @deployArgs
    if ($LASTEXITCODE -ne 0) {
        throw "gcloud run deploy failed with exit code $LASTEXITCODE."
    }
}
finally {
    if ($normalizedEnvFile -and (Test-Path $normalizedEnvFile)) {
        Remove-Item -Path $normalizedEnvFile -Force
    }
}
