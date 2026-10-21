# TRT Atlas

TRT çalışanları için macOS menü çubuğu uygulaması. PDKS'deki giriş saatinize göre mesai bitişinizi, haftalık giriş-çıkış özetinizi ve günün yemek menüsünü gösterir.

Bu depo yalnızca kurulum ve sürüm dağıtımı içindir.

> **Önemli: Kurum ağı veya VPN gerekir.** PDKS yalnızca TRT kurum ağından erişilebilir. Bilgisayarınız kurum ağına ya da kurum ağına bağlanan VPN'e bağlı değilse giriş-çıkış verileri PDKS'den alınamaz; uygulama "PDKS'ye ulaşılamadı" uyarısı gösterir ve son alınan veriler görünmeye devam eder. Ağa bağlandığınızda veriler bir sonraki yenilemede (veya **↻ Yenile** ile hemen) güncellenir.

## Kurulum

Terminal'i açın ve şu komutu çalıştırın:

```bash
curl -fsSL https://raw.githubusercontent.com/mucahitpuren/trt-atlas/main/install.sh | bash
```

Komut son sürümü indirir, `~/Applications/TRT Atlas.app` konumuna kurar ve açar. TRT Atlas simgesi menü çubuğunun sağ üstünde görünür. Simgeye tıklayıp ⚙︎ ile Tercihler'i açın ve PDKS kullanıcı adınızı ve şifrenizi girin. **Bağlantıyı test et** düğmesinin çalışması için de kurum ağına veya VPN'e bağlı olmanız gerekir.

TRT Mesai'nin (eski ad) kurulu olduğu bilgisayarlarda da aynı komutu çalıştırın. Eski sürüm kaldırılır; ayarlarınız ve PDKS şifreniz yeni sürüme taşınır.

## Güncelleme

Yeni sürüm yayımlandığında bildirim gelir ve menüde **Güncelle** düğmesi görünür. Güncelleme uygulamanın içinden kurulur.

## Gizlilik

- PDKS şifreniz yalnızca macOS Anahtar Zinciri'nde saklanır.
- T.C. kimlik numarası okunmaz, saklanmaz.
- Veriler bilgisayarınızda kalır; uygulama yalnızca PDKS ve TRT kurumsal portalı ile iletişim kurar.

## Sorun bildirme

Uygulamada menünün altındaki **Sorun bildir** bağlantısını kullanın ya da bu deponun [Issues](https://github.com/mucahitpuren/trt-atlas/issues) sayfasından kayıt açın. Kullanıcı adı, şifre veya kimlik numarası paylaşmayın.

---

Mücahit Püren tarafından geliştirildi.
