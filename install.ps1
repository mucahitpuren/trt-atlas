# TRT Atlas kurulum betiği (Windows).
#
#   irm https://raw.githubusercontent.com/mucahitpuren/trt-atlas/main/install.ps1 | iex
#
# Son sürümün kurulum dosyasını indirir ve çalıştırır. PowerShell ile indirilen dosyaya
# Windows "başka bir yerden geldi" etiketi (Mark-of-the-Web) eklemediği için, uygulama imzasız
# olsa da SmartScreen uyarısına çoğu durumda takılmaz — tarayıcıdan indirilen dosyada takılır.
# Bu, macOS tarafında curl'ün karantina etiketi eklememesiyle aynı mantık.
#
# Sonraki güncellemeler uygulamanın içinden gelir (Tercihler > Güncellemeler). Bu betik tekrar
# çalıştırılırsa da son sürüme günceller.
#
# İndirilmiş bir kurulum dosyasından kurmak için yolunu verin:
#
#   powershell -File install.ps1 -Installer C:\Users\siz\Downloads\TRT-Atlas-Setup.exe

[CmdletBinding()]
param(
    [string]$Installer
)

$ErrorActionPreference = 'Stop'

$SetupUrl = 'https://github.com/mucahitpuren/trt-atlas/releases/latest/download/TRT-Atlas-Setup.exe'
$AppName = 'TRT Atlas'

# Windows 10 1809 (derleme 17763) ve üzeri. Alt sürümlerde kurulum tamamlanır ama uygulama
# açılmaz, o yüzden baştan ve anlaşılır biçimde durdurulur.
$build = [Environment]::OSVersion.Version.Build
if ($build -lt 17763) {
    Write-Error "Bu uygulama Windows 10 sürüm 1809 (derleme 17763) ve üzerini gerektirir. Bu bilgisayarda derleme $build var."
    return
}

$temp = Join-Path ([IO.Path]::GetTempPath()) ("trt-atlas-" + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $temp -Force | Out-Null

try {
    if ($Installer) {
        if (-not (Test-Path $Installer)) {
            Write-Error "Kurulum dosyası bulunamadı: $Installer"
            return
        }
        $setup = $Installer
    } else {
        $setup = Join-Path $temp 'TRT-Atlas-Setup.exe'
        Write-Host '-> Son sürüm indiriliyor...'
        # Invoke-WebRequest, tarayıcıların aksine Mark-of-the-Web eklemez.
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $SetupUrl -OutFile $setup -UseBasicParsing
    }

    # Çalışan bir kopyanın üzerine yazılmaz.
    $running = Get-Process -Name 'trt-atlas', 'TRT Atlas' -ErrorAction SilentlyContinue
    if ($running) {
        Write-Host "-> Çalışan $AppName kapatılıyor..."
        $running | Stop-Process -Force
        Start-Sleep -Seconds 1
    }

    Write-Host '-> Kuruluyor...'
    # /P: kullanıcıya pencere gösterir ama soru sormaz. Kurulum kullanıcı klasörüne yapılır,
    # yönetici izni istemez.
    $process = Start-Process -FilePath $setup -ArgumentList '/P' -Wait -PassThru
    if ($process.ExitCode -ne 0) {
        Write-Error "Kurulum tamamlanamadı (çıkış kodu $($process.ExitCode))."
        return
    }

    Write-Host ''
    Write-Host "Kurulum tamamlandı. $AppName simgesi sistem tepsisinde (saatin yanında) görünür."
    Write-Host 'PDKS kullanıcı adı ve şifrenizi simgeye sağ tıklayıp Tercihler''den girin.'
    Write-Host 'PDKS''ye ulaşmak için kurum ağına veya kurum VPN''ine bağlı olmanız gerekir.'
}
finally {
    Remove-Item -Recurse -Force $temp -ErrorAction SilentlyContinue
}
