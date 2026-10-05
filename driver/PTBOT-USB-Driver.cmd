@echo off
rem PTBOT USB driver installer (Windows 10 1803+ / 11): installs the Silicon Labs CP210x driver 11.5 over whatever is
rem there. The driver itself comes from Microsoft Update (signed by Microsoft); nothing of Silicon Labs is shipped here.
rem Fixes: robot not in the port list, and "hold button B" uploads from Arduino IDE (old driver 6.7.x).
net session >nul 2>&1 || (powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs" & exit /b)
powershell -NoProfile -ExecutionPolicy Bypass -Command "$s=[IO.File]::ReadAllText('%~f0',[Text.Encoding]::UTF8); iex $s.Substring($s.IndexOf('#PS'+'#')+4)"
exit /b
#PS#
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
$title = 'PTBOT - USB driver'
function Say($text, $icon) { [void][System.Windows.Forms.MessageBox]::Show($text, $title, 'OK', $icon) }
# Silicon Labs CP210x Universal driver 11.5.0.417, Microsoft Update Catalog (Windows 10 1803+ and 11; x64, x86, arm64).
# The file name ends with its SHA-1: a damaged or different download is refused.
$url = 'https://catalog.s.download.windowsupdate.com/c/msdownload/update/driver/drvs/2026/02/3bc68c22-eb83-4383-b451-4c581d06d3fb_6092f1062939e09f524b5d8e9108530f7f516f13.cab'
$sha1 = '6092f1062939e09f524b5d8e9108530f7f516f13'
# Windows' own tools by full path (32-bit PowerShell on 64-bit Windows sees them under Sysnative)
$sys = if ([IO.Directory]::Exists("$env:windir\Sysnative")) { "$env:windir\Sysnative" } else { "$env:windir\System32" }
$dir = [IO.Path]::Combine([IO.Path]::GetTempPath(), 'ptbot-usb-driver')  # .NET paths: short (8.3) TEMP names are fine
try {
  Write-Host 'PTBOT: downloading the USB driver (Silicon Labs CP210x 11.5, from Microsoft Update)...'
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  if ([IO.Directory]::Exists($dir)) { [IO.Directory]::Delete($dir, $true) }
  [void][IO.Directory]::CreateDirectory($dir)
  $cab = Join-Path $dir 'driver.cab'
  (New-Object Net.WebClient).DownloadFile($url, $cab)
  if ((Get-FileHash -LiteralPath $cab -Algorithm SHA1).Hash -ne $sha1) { throw 'download damaged (checksum)' }
  $null = & "$sys\expand.exe" $cab -F:* $dir
  $inf = [IO.Path]::Combine($dir, 'silabser.inf')
  if (-not [IO.File]::Exists($inf)) { throw 'driver file missing after unpacking' }
  Write-Host 'PTBOT: installing...'
  & "$sys\pnputil.exe" /add-driver $inf /install | Write-Host
  # 0 = installed, 3010 = installed (restart later), 259 = no robot plugged in now (used when it is)
  if ($LASTEXITCODE -notin 0, 259, 3010) { throw "pnputil $LASTEXITCODE" }
  Say ("ติดตั้งไดรเวอร์ USB เสร็จแล้ว`n`nถอดสายหุ่นแล้วเสียบใหม่ ก็ใช้งานได้เลย`n`n" +
       "USB driver installed. Unplug the robot and plug it in again.") 'Information'
} catch {
  Say ("ติดตั้งไม่สำเร็จ: ต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง`n" +
       "ถ้ายังไม่ได้ ดาวน์โหลดเองที่ silabs.com/developer-tools/usb-to-uart-bridge-vcp-drivers`n`n" +
       "Install failed: connect to the internet and try again.`n($($_.Exception.Message))") 'Warning'
} finally {
  try { if ([IO.Directory]::Exists($dir)) { [IO.Directory]::Delete($dir, $true) } } catch {}
}
