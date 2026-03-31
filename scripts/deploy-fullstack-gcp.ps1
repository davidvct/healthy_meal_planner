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

    [switch]$FrontendRequireInvokerAuth,

    [string]$AdminApiKey = "",

    [string]$SchedulerServiceAccount = ""
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
$backendOrigin = $backendUrl.TrimEnd('/')

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
    "--set-env-vars"
    "BACKEND_ORIGIN=$backendOrigin"
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

# ── Cloud Scheduler: survey email cron job ────────────────────────
if ([string]::IsNullOrWhiteSpace($AdminApiKey)) {
    Write-Host "WARNING: AdminApiKey not provided — skipping Cloud Scheduler job setup."
    Write-Host "  Pass -AdminApiKey to create the scheduled survey email job."
}
else {
    $schedulerJobName = "send-survey-monthly"
    $surveyEndpoint = "$($backendUrl.TrimEnd('/'))/admin/send-survey"

    # Resolve service account for OIDC authentication
    if ([string]::IsNullOrWhiteSpace($SchedulerServiceAccount)) {
        $SchedulerServiceAccount = & gcloud iam service-accounts list `
            --project $ProjectId `
            --filter "displayName:Default compute" `
            --format "value(email)" 2>$null
    }

    Write-Host "Creating/updating Cloud Scheduler job '$schedulerJobName'..."

    $schedulerArgs = @(
        "scheduler"
        "jobs"
        "update"
        "http"
        $schedulerJobName
        "--project"
        $ProjectId
        "--location"
        $Region
        "--schedule"
        "0 9 1 * *"
        "--time-zone"
        "Asia/Singapore"
        "--uri"
        $surveyEndpoint
        "--http-method"
        "POST"
        "--headers"
        "X-Admin-Key=$AdminApiKey,Content-Type=application/json"
    )

    if (-not [string]::IsNullOrWhiteSpace($SchedulerServiceAccount)) {
        $schedulerArgs += "--oidc-service-account-email"
        $schedulerArgs += $SchedulerServiceAccount
    }

    & gcloud @schedulerArgs 2>$null

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Scheduler job not found, creating new job..."
        $schedulerArgs[2] = "create"
        & gcloud @schedulerArgs

        if ($LASTEXITCODE -ne 0) {
            Write-Host "WARNING: Failed to create Cloud Scheduler job '$schedulerJobName'. Create it manually."
        }
        else {
            Write-Host "Cloud Scheduler job '$schedulerJobName' created successfully."
        }
    }
    else {
        Write-Host "Cloud Scheduler job '$schedulerJobName' updated successfully."
    }
}
