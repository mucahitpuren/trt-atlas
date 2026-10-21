#!/bin/bash
# TRT Atlas kurulum betiği.
#
#   curl -fsSL https://raw.githubusercontent.com/mucahitpuren/trt-atlas/main/install.sh | bash
#
# Son sürümün DMG'sini curl ile indirir ve uygulamayı ~/Applications'a kurar. curl ile indirilen
# dosyalara karantina etiketi eklenmediği için, uygulama ad-hoc imzalı olsa da Gatekeeper'a
# takılmadan açılır ("Yine de Aç" adımı gerekmez). Kurulum ~/Applications'a yapılır: yönetici
# izni istemez ve /Applications'taki Uygulama Yönetimi korumasına takılmaz.
#
# Sonraki güncellemeler uygulamanın içinden gelir (menü > Güncelle). Bu betik yeniden
# çalıştırılırsa da son sürüme günceller.
#
# Tarayıcıyla indirilmiş bir DMG'den kurmak için yolunu verin:
#
#   bash install.sh ~/Downloads/TRT-Atlas.dmg
set -euo pipefail

DMG_URL="https://github.com/mucahitpuren/trt-atlas/releases/latest/download/TRT-Atlas.dmg"
APP_NAME="TRT Atlas.app"
DEST_DIR="$HOME/Applications"
DEST="$DEST_DIR/$APP_NAME"
# Önceki adlar (TRT Mesai 0.1.x, Atlas 0.2.x): kurulumda kapatılır ve ~/Applications'tan kaldırılır.
OLD_APP_NAMES=("TRTMesai.app" "Atlas.app")
OLD_PROCESSES=("TRTMesai" "Atlas")

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "Bu uygulama yalnızca macOS'ta çalışır." >&2
  exit 1
fi

TMP="$(mktemp -d)"
MOUNT="$TMP/mnt"
cleanup() {
  hdiutil detach -quiet "$MOUNT" 2>/dev/null || true
  rm -rf "$TMP"
}
trap cleanup EXIT

if [[ $# -gt 0 ]]; then
  DMG="$1"
  if [[ ! -f "$DMG" ]]; then
    echo "DMG bulunamadı: $DMG" >&2
    exit 1
  fi
else
  DMG="$TMP/TRT-Atlas.dmg"
  echo "→ Son sürüm indiriliyor…"
  curl -fL --progress-bar -o "$DMG" "$DMG_URL"
fi

echo "→ Disk görüntüsü açılıyor…"
mkdir -p "$MOUNT"
hdiutil attach -quiet -nobrowse -readonly -mountpoint "$MOUNT" "$DMG"

if [[ ! -d "$MOUNT/$APP_NAME" ]]; then
  echo "DMG içinde $APP_NAME bulunamadı." >&2
  exit 1
fi

# Çalışan eski sürümleri kapat; açık bir uygulamanın üzerine yazılmaz.
for proc in "TRT Atlas" "${OLD_PROCESSES[@]}"; do
  if pgrep -x "$proc" >/dev/null; then
    echo "→ Çalışan $proc kapatılıyor…"
    pkill -x "$proc" || true
    sleep 1
  fi
done

echo "→ $DEST kuruluyor…"
mkdir -p "$DEST_DIR"
rm -rf "$DEST"
ditto --noextattr --noqtn "$MOUNT/$APP_NAME" "$DEST"
# Güvence: curl karantina eklemez, ama dosya başka yoldan geldiyse etiketi temizle.
xattr -dr com.apple.quarantine "$DEST" 2>/dev/null || true

# Eski adla kurulmuş kopyalar yerini TRT Atlas'a bırakır. Ayarlar ve PDKS şifresi ilk açılışta taşınır.
for old in "${OLD_APP_NAMES[@]}"; do
  if [[ -d "$DEST_DIR/$old" ]]; then
    echo "→ Eski sürüm ($DEST_DIR/$old) kaldırılıyor…"
    rm -rf "$DEST_DIR/$old"
  fi
done

for old in "$APP_NAME" "${OLD_APP_NAMES[@]}"; do
  [[ -d "/Applications/$old" ]] || continue
  echo
  echo "Not: /Applications/$old konumunda eski bir kopya var. İki kopya karışmasın diye"
  echo "Finder'dan onu Çöp'e taşıyın; bundan sonra ~/Applications'taki kopya kullanılır."
done

echo "→ TRT Atlas açılıyor…"
open "$DEST"

echo
echo "Kurulum tamamlandı. TRT Atlas simgesi menü çubuğunun sağ üstünde görünür."
echo "PDKS kullanıcı adı ve şifrenizi simgeye tıklayıp Tercihler'den girin."
