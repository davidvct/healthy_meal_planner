[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectId,

    [string]$Region = "asia-southeast1",

    [string]$BackendServiceName = "meal-planner-api",

    [string]$FrontendServiceName = "meal-planner-web",

    [string]$BackendEnvVarsFile = "",

    [string]$CloudSqlInstance = "",

    [int]$BackendMinInstances = 0,

    [int]$BackendMaxInstances = 10,

    [int]$BackendConcurrency = 80,

    [string]$BackendMemory = "512Mi",

    [string]$BackendCpu = "1",

    [int]$FrontendMinInstances = 0,

    [int]$FrontendMaxInstances = 3,

    [int]$FrontendConcurrency = 80,

    [string]$FrontendMemory = "256Mi",

    [string]$FrontendCpu = "1",

    [switch]$BackendRequireInvokerAuth,

    [switch]$FrontendRequireInvokerAuth
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendScript = Join-Path $PSScriptRoot "deploy-gcp.ps1"
$frontendSourcePath = Join-Path $repoRoot "frontend"

if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    throw "gcloud CLI is required but was not found in PATH."
}

if (-not (Test-Path $backendScript)) {
    throw "Backend deployment script not found at $backendScript"
}

Write-Host "Deploying backend service $BackendServiceName..."

$backendArgs = @{
    ProjectId = $ProjectId
    Region = $Region
    ServiceName = $BackendServiceName
    SourcePath = "."
    CloudSqlInstance = $CloudSqlInstance
    MinInstances = $BackendMinInstances
    MaxInstances = $BackendMaxInstances
    Concurrency = $BackendConcurrency
    Memory = $BackendMemory
    Cpu = $BackendCpu
}

if (-not [string]::IsNullOrWhiteSpace($BackendEnvVarsFile)) {
    $backendArgs["EnvVarsFile"] = $BackendEnvVarsFile
}

if ($BackendRequireInvokerAuth) {
    $backendArgs["RequireInvokerAuth"] = $true
}

& $backendScript @backendArgs

Write-Host "Fetching backend URL..."
$backendUrl = & gcloud run services describe $BackendServiceName `
    --project $ProjectId `
    --region $Region `
    --format "value(status.url)"

if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($backendUrl)) {
    throw "Failed to resolve backend URL for service $BackendServiceName."
}

$frontendApiBaseUrl = "$($backendUrl.TrimEnd('/'))/api"
Write-Host "Deploying frontend service $FrontendServiceName with API base URL $frontendApiBaseUrl ..."

$frontendDeployArgs = @(
    "run"
    "deploy"
    $FrontendServiceName
    "--project"
    $ProjectId
    "--source"
    $frontendSourcePath
    "--region"
    $Region
    "--platform"
    "managed"
    "--port"
    "8080"
    "--cpu"
    $FrontendCpu
    "--memory"
    $FrontendMemory
    "--concurrency"
    "$FrontendConcurrency"
    "--min-instances"
    "$FrontendMinInstances"
    "--max-instances"
    "$FrontendMaxInstances"
    "--set-build-env-vars"
    "VITE_API_BASE_URL=$frontendApiBaseUrl"
)

if ($FrontendRequireInvokerAuth) {
    $frontendDeployArgs += "--no-allow-unauthenticated"
}
else {
    $frontendDeployArgs += "--allow-unauthenticated"
}

& gcloud @frontendDeployArgs

if ($LASTEXITCODE -ne 0) {
    throw "Frontend deployment failed with exit code $LASTEXITCODE."
}

Write-Host "Full-stack deployment completed."
Write-Host "Backend URL: $backendUrl"

$frontendUrl = & gcloud run services describe $FrontendServiceName `
    --project $ProjectId `
    --region $Region `
    --format "value(status.url)"

if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($frontendUrl)) {
    Write-Host "Frontend URL: $frontendUrl"
}
