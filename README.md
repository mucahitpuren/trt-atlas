# TRT Atlas

TRT çalışanları için macOS menü çubuğu ve Windows sistem tepsisi uygulaması. PDKS'deki giriş saatinize göre mesai bitişinizi, haftalık giriş-çıkış özetinizi ve günün yemek menüsünü gösterir.

Bu depo yalnızca kurulum ve sürüm dağıtımı içindir.

> **Önemli: Kurum ağı veya VPN gerekir.** PDKS yalnızca TRT kurum ağından erişilebilir. Bilgisayarınız kurum ağına ya da kurum ağına bağlanan VPN'e bağlı değilse giriş-çıkış verileri PDKS'den alınamaz; uygulama "PDKS'ye ulaşılamadı" uyarısı gösterir ve son alınan veriler görünmeye devam eder. Ağa bağlandığınızda veriler bir sonraki yenilemede (veya **↻ Yenile** ile hemen) güncellenir.

## Kurulum

### macOS

Terminal'i açın ve şu komutu çalıştırın:

```bash
curl -fsSL https://raw.githubusercontent.com/mucahitpuren/trt-atlas/main/install.sh | bash
```

Komut son sürümü indirir, `~/Applications/TRT Atlas.app` konumuna kurar ve açar. TRT Atlas simgesi menü çubuğunun sağ üstünde görünür.

TRT Mesai'nin (eski ad) kurulu olduğu bilgisayarlarda da aynı komutu çalıştırın. Eski sürüm kaldırılır; ayarlarınız ve PDKS şifreniz yeni sürüme taşınır.

### Windows

PowerShell'i açın ve şu komutu çalıştırın:

```powershell
irm https://raw.githubusercontent.com/mucahitpuren/trt-atlas/main/install.ps1 | iex
```

Komut son sürümü indirip kurar. TRT Atlas simgesi sistem tepsisinde, saatin yanında görünür. Windows 10 sürüm 1809 ve üzeri gerekir.

### İlk ayar (her iki sürümde de)

Simgeye tıklayıp **Tercihler**'i açın, PDKS kullanıcı adınızı ve şifrenizi girin. **Bağlantıyı test et** düğmesinin çalışması için kurum ağına veya VPN'e bağlı olmanız gerekir.

## Güncelleme

Yeni sürüm yayımlandığında bildirim gelir ve menüde **Güncelle** düğmesi görünür. Güncelleme uygulamanın içinden kurulur; kurulum komutunu tekrar çalıştırmanız gerekmez.

## İki sürüm arasındaki farklar

Her iki sürüm de aynı işi yapar ve mesai hesabında aynı kuralları uygular. Windows'ta bulunmayan tek şey, işletim sisteminin elvermediği iki özelliktir:

- **Menü çubuğunda metin.** macOS'ta mesai bitiş saatini ikonun yanında gösterebilirsiniz. Windows tepsi simgesinin yanına metin yazılamadığı için bu bilgi, simgenin üzerine geldiğinizde çıkan ipucunda görünür.
- **Bildirim izni durumu.** macOS uygulaması bildirimlere izin verilip verilmediğini size söyleyebilir. Windows'ta böyle bir sorgu yoktur; Tercihler'deki **Test bildirimi gönder** düğmesiyle deneyebilirsiniz.

## Gizlilik

- PDKS şifreniz yalnızca işletim sisteminin kendi kasasında saklanır: macOS'ta **Anahtar Zinciri**, Windows'ta **Kimlik Bilgileri Yöneticisi**. Dosyaya veya günlüğe yazılmaz.
- T.C. kimlik numarası okunmaz, saklanmaz.
- Veriler bilgisayarınızda kalır; uygulama yalnızca PDKS ve TRT kurumsal portalı ile iletişim kurar.
- Windows sürümü bir günlük dosyası tutar. İçinde sayfa durumları ve hata türleri vardır; kullanıcı adı, şifre, gerçek giriş-çıkış saatleri veya sayfa içeriği **yazılmaz**.

## Sorun bildirme

Uygulamada menünün altındaki **Sorun bildir** bağlantısını kullanın ya da bu deponun [Issues](https://github.com/mucahitpuren/trt-atlas/issues) sayfasından kayıt açın. Kullanıcı adı, şifre veya kimlik numarası paylaşmayın.

---

Mücahit Püren tarafından geliştirildi.
