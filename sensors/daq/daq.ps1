# daq.ps1 — run the Ravelston logger from Windows against the repo living in WSL.
#
# WSL cannot see Bluetooth adapters, so the logger has to run on Windows. It
# does not need to be COPIED there: Windows reads the WSL filesystem over
# \\wsl.localhost, so this stays one source of truth.
#
#   .\daq.ps1 scan                     find the sensors, save their addresses
#   .\daq.ps1 record empty_palm_hits   record until you press Ctrl+C
#   .\daq.ps1 check  empty_palm_hits   is that recording trustworthy?
#   .\daq.ps1 list                     what have I recorded so far
#
# Sessions land in %USERPROFILE%\bar-data, which WSL reads at
# /mnt/c/Users/<you>/bar-data for analysis.

param(
    [Parameter(Position = 0)]
    [ValidateSet('scan', 'record', 'check', 'list')]
    [string]$Cmd = 'scan',

    [Parameter(Position = 1)]
    [string]$Name,

    [int]$Rate = 100,
    [string]$Label = ''
)

$ErrorActionPreference = 'Stop'

# --- locate python -----------------------------------------------------------
$py = $null
foreach ($c in @(
        "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe",
        "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe")) {
    if (Test-Path $c) { $py = $c; break }
}
if (-not $py) { $py = (Get-Command python.exe -ErrorAction SilentlyContinue).Source }
if (-not $py) { throw "No Windows Python found. Install it from python.org, then: pip install bleak" }

# --- locate the repo over the WSL share --------------------------------------
$daq = $null
foreach ($d in @('Ubuntu-24.04', 'Ubuntu')) {
    $p = "\\wsl.localhost\$d\home\eli\ravelston\sensors\daq"
    if (Test-Path $p) { $daq = $p; break }
}
if (-not $daq) { throw "Cannot reach the repo over \\wsl.localhost. Is WSL running? Try: wsl -d Ubuntu-24.04 echo ok" }

$data = "$env:USERPROFILE\bar-data"
$addrFile = Join-Path $data 'sensors.txt'
if (-not (Test-Path $data)) { New-Item -ItemType Directory -Path $data | Out-Null }

function Get-Addresses {
    if (-not (Test-Path $addrFile)) {
        throw "No sensor addresses saved yet. Run:  .\daq.ps1 scan"
    }
    $a = Get-Content $addrFile | Where-Object { $_.Trim() -and -not $_.StartsWith('#') }
    if ($a.Count -lt 1) { throw "$addrFile is empty. Run:  .\daq.ps1 scan" }
    if ($a.Count -eq 1) { Write-Host "Only one sensor listed - recording a single node." -ForegroundColor Yellow }
    return $a
}

switch ($Cmd) {

    'scan' {
        Write-Host "Scanning. Wake both sensors first (press the button / shake them).`n"
        & $py "$daq\logger.py" scan
        Write-Host "`nPut the two addresses into this file, one per line:"
        Write-Host "  $addrFile" -ForegroundColor Cyan
        Write-Host "Order matters only for your own bookkeeping - put the LEFT bar end first,"
        Write-Host "and mark the sensors physically so the order stays true."
        if (-not (Test-Path $addrFile)) {
            @('# One sensor address per line. Left bar end first.') |
                Set-Content $addrFile
            Write-Host "`nCreated $addrFile - paste the addresses in and save."
        }
    }

    'record' {
        if (-not $Name) { throw "Give the session a name, e.g.  .\daq.ps1 record 60kg_palm_hits" }
        if ($Name -notmatch 'kg' -and $Name -notmatch '^(empty|bare|raw|desk|mount)') {
            Write-Host "Heads up: the analysis reads the load out of the name." -ForegroundColor Yellow
            Write-Host "Use something like 60kg_palm_hits, or empty_palm_hits for the bare bar.`n" -ForegroundColor Yellow
        }
        $out = Join-Path $data $Name
        if (Test-Path $out) { throw "$out already exists - pick another name so you don't overwrite a session." }

        $args = @("$daq\logger.py", 'record', '--rate', $Rate, '--out', $out)
        foreach ($a in Get-Addresses) { $args += @('--address', $a.Trim()) }
        if ($Label) { $args += @('--label', $Label) }

        Write-Host "Recording to $out  -  Ctrl+C to stop.`n" -ForegroundColor Cyan
        & $py @args
        Write-Host "`nNow check it:  .\daq.ps1 check $Name" -ForegroundColor Cyan
    }

    'check' {
        if (-not $Name) { throw "Which session? e.g.  .\daq.ps1 check desk_test" }
        & $py "$daq\benchcheck.py" (Join-Path $data $Name)
    }

    'list' {
        if (-not (Test-Path $data)) { Write-Host 'Nothing recorded yet.'; break }
        Get-ChildItem $data -Directory | Sort-Object LastWriteTime | ForEach-Object {
            $n = (Get-ChildItem $_.FullName -Filter *.csv | Measure-Object).Count
            '{0,-32} {1}  ({2} csv)' -f $_.Name, $_.LastWriteTime.ToString('yyyy-MM-dd HH:mm'), $n
        }
        Write-Host "`nIn WSL these are at /mnt/c/Users/$env:USERNAME/bar-data/"
    }
}
