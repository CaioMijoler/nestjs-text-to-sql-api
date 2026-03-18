# ============================================================
# Text-to-SQL Analytics Test Suite (curl version)
# Runs 10 business questions against POST /insights
# and generates a Markdown report with results.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File test\run-analytics-tests.ps1
#   powershell -ExecutionPolicy Bypass -File test\run-analytics-tests.ps1 -BaseUrl "http://localhost:3003"
#
# Requirements: curl.exe (built-in on Windows 10+)
# ============================================================

param(
    [string]$BaseUrl = "http://localhost:3001",
    [string]$ReportPath = (Join-Path $PSScriptRoot "analytics-test-report.md"),
    [int]$DelayBetweenTests = 3
)

$curlCmd = "curl.exe"

# Verify server is reachable before starting
Write-Host "Checking server at $BaseUrl ..." -ForegroundColor Cyan
try {
    $check = & $curlCmd -s -o NUL -w "%{http_code}" "$BaseUrl" --max-time 5 2>&1
    Write-Host "Server responded with HTTP $check" -ForegroundColor Green
} catch {
    Write-Host "WARNING: Could not reach $BaseUrl - make sure the server is running!" -ForegroundColor Red
}

$questions = @(
    "Quais sao os produtos mais populares entre os clientes corporativos?",
    "Quais sao os produtos mais vendidos em termos de quantidade?",
    "Qual e o volume de vendas por cidade?",
    "Quais sao os clientes que mais compraram?",
    "Quais sao os produtos mais caros da loja?",
    "Quais sao os fornecedores mais frequentes nos pedidos?",
    "Quais os melhores vendedores?",
    "Qual e o valor total de todas as vendas realizadas por ano?",
    "Qual e o valor total de vendas por categoria de produto?",
    "Qual o ticket medio por compra?"
)

$report = @"
# Text-to-SQL Analytics Test Report
- **Date:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
- **Endpoint:** ``POST $BaseUrl/insights``
- **Total Questions:** $($questions.Count)

---

"@

$passed = 0
$failed = 0

for ($i = 0; $i -lt $questions.Count; $i++) {
    $q = $questions[$i]
    $num = $i + 1
    Write-Host "`n[$num/$($questions.Count)] Testing: $q" -ForegroundColor Cyan

    # Write JSON body to temp file WITHOUT BOM
    $tempFile = [System.IO.Path]::GetTempFileName()
    $jsonContent = "{""question"":""$q""}"
    [System.IO.File]::WriteAllText($tempFile, $jsonContent, [System.Text.UTF8Encoding]::new($false))

    $status = "PASS"
    $sql = ""
    $dataPreview = ""
    $errorMsg = ""
    $elapsed = 0

    try {
        $sw = [System.Diagnostics.Stopwatch]::StartNew()

        # curl.exe call with long timeout for slow LLM responses
        $rawResponse = & $curlCmd -s -w "`n%{http_code}" `
            -X POST "$BaseUrl/insights" `
            -H "Content-Type: application/json" `
            -d "@$tempFile" `
            --connect-timeout 10 `
            --max-time 600 2>&1

        $sw.Stop()
        $elapsed = [math]::Round($sw.Elapsed.TotalSeconds, 1)

        # Clean up temp file
        Remove-Item -Path $tempFile -Force -ErrorAction SilentlyContinue

        # Parse response: last line is HTTP code, rest is body
        $responseText = ($rawResponse | Out-String).Trim()
        $lastNewline = $responseText.LastIndexOf("`n")
        if ($lastNewline -gt 0) {
            $responseBody = $responseText.Substring(0, $lastNewline).Trim()
            $httpCode = $responseText.Substring($lastNewline + 1).Trim()
        } else {
            $responseBody = ""
            $httpCode = $responseText.Trim()
        }

        Write-Host "  HTTP $httpCode ($($elapsed)s)" -ForegroundColor DarkGray

        if ($httpCode -ne "200" -and $httpCode -ne "201") {
            throw "HTTP $httpCode - $responseBody"
        }

        $parsed = $responseBody | ConvertFrom-Json
        $sql = $parsed.generatedSql
        $rows = $parsed.data

        if ($rows -and $rows.Count -gt 0) {
            $previewCount = [math]::Min($rows.Count, 5)
            $cols = $rows[0].PSObject.Properties.Name

            $dataPreview += "| " + ($cols -join " | ") + " |`n"
            $dataPreview += "| " + (($cols | ForEach-Object { "---" }) -join " | ") + " |`n"

            for ($r = 0; $r -lt $previewCount; $r++) {
                $vals = $cols | ForEach-Object { "$($rows[$r].$_)" }
                $dataPreview += "| " + ($vals -join " | ") + " |`n"
            }

            if ($rows.Count -gt 5) {
                $dataPreview += "`n*... and $($rows.Count - 5) more rows*`n"
            }
            $dataPreview += "`n**Total rows returned:** $($rows.Count)"
        } else {
            $dataPreview = "*No rows returned.*"
        }

        $passed++
        Write-Host "  PASS ($($elapsed)s) - $($rows.Count) rows" -ForegroundColor Green
    }
    catch {
        Remove-Item -Path $tempFile -Force -ErrorAction SilentlyContinue
        if ($sw.IsRunning) { $sw.Stop() }
        $elapsed = [math]::Round($sw.Elapsed.TotalSeconds, 1)
        $status = "FAIL"
        $errorMsg = $_.Exception.Message
        if (-not $errorMsg) { $errorMsg = "$_" }
        $failed++
        Write-Host "  FAIL ($($elapsed)s) - $errorMsg" -ForegroundColor Red
    }

    $statusEmoji = if ($status -eq "PASS") { "✅" } else { "❌" }

    $report += @"
## $statusEmoji Test $num — $q

- **Status:** ``$status``
- **Response Time:** $($elapsed)s

"@

    if ($status -eq "PASS") {
        $report += @"
### Generated SQL
``````sql
$sql
``````

### Results (preview)
$dataPreview

"@
    } else {
        $report += @"
### Error
``````
$errorMsg
``````

"@
    }

    $report += "---`n`n"

    if ($i -lt ($questions.Count - 1)) {
        Write-Host "  Waiting $DelayBetweenTests seconds..." -ForegroundColor DarkGray
        Start-Sleep -Seconds $DelayBetweenTests
    }
}

$report += @"
## Summary

| Metric | Value |
|--------|-------|
| Total Tests | $($questions.Count) |
| Passed | $passed |
| Failed | $failed |
| Success Rate | $([math]::Round($passed / $questions.Count * 100, 1))% |
"@

$report | Out-File -FilePath $ReportPath -Encoding UTF8 -Force

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "Report saved to: $ReportPath" -ForegroundColor Yellow
Write-Host "Passed: $passed / $($questions.Count)" -ForegroundColor $(if ($failed -eq 0) {"Green"} else {"Yellow"})
Write-Host "========================================" -ForegroundColor Yellow
