# TRT Atlas

TRT çalışanları için macOS menü çubuğu ve Windows sistem tepsisi uygulaması. PDKS'deki giriş saatinize göre mesai bitişinizi, haftalık ve aylık çalışma sürenizi ve günün yemek menüsünü gösterir.

Bu depo yalnızca kurulum ve sürüm dağıtımı içindir.

> **Önemli: Kurum ağı veya VPN gerekir.** PDKS yalnızca TRT kurum ağından erişilebilir. Bilgisayarınız kurum ağına ya da kurum ağına bağlanan VPN'e bağlı değilse giriş-çıkış verileri PDKS'den alınamaz; uygulama "PDKS'ye ulaşılamadı" uyarısı gösterir ve son alınan veriler görünmeye devam eder. Ağa bağlandığınızda veriler bir sonraki yenilemede (veya **↻ Yenile** ile hemen) güncellenir.

## Kurulum

### macOS

Terminal'i açın ve şu komutu çalıştırın:

```bash
curl -fsSL https://raw.githubusercontent.com/mucahitpuren/trt-atlas/main/install.sh | bash
```

Komut son sürümü indirir, `~/Applications/TRT Atlas.app` konumuna kurar ve açar. TRT Atlas simgesi menü çubuğunun sağ üstünde görünür. macOS 12 (Monterey) veya daha yeni bir sürüm gerekir.

TRT Mesai'nin (eski ad) kurulu olduğu bilgisayarlarda da aynı komutu çalıştırın. Eski sürüm kaldırılır; ayarlarınız ve PDKS şifreniz yeni sürüme taşınır.

### Windows

PowerShell'i açın ve şu komutu çalıştırın:

```powershell
irm https://raw.githubusercontent.com/mucahitpuren/trt-atlas/main/install.ps1 | iex
```

Komut son sürümü indirip kurar. TRT Atlas simgesi sistem tepsisinde, saatin yanında görünür. Windows 10 sürüm 1809 ve üzeri gerekir.

### İlk ayar (her iki sürümde de)

İlk açılışta bir kurulum ekranı PDKS kullanıcı adınızı ve şifrenizi, çalışma düzeninizi ve bildirim tercihlerinizi sorar. Bağlantının kurulabilmesi için kurum ağına veya VPN'e bağlı olmanız gerekir; giriş başarısız olursa nedeni ekranda yazar. PDKS hesabı girmeden de devam edebilirsiniz: günün yemek menüsü yine görünür.

Bu ayarların hepsini daha sonra simgeye tıklayıp sağ üstteki dişliyle açılan **Ayarlar** penceresinden değiştirebilirsiniz.

## Kullanım

- **Gün:** Giriş saatiniz, mesai bitişiniz, geçen ve kalan süre ile günün yemek menüsü.
- **Hafta:** 40 saatlik haftalık hedefe ilerleme. Bir gün erken çıkıp başka bir gün telafi ettiğinizde hafta tamamlanmış sayılır. ‹ › ile önceki haftalara gidebilirsiniz.
- **Ay:** Takvim. Tamamlanan iş günleri yeşil, eksik olanlar kırmızı; günün üzerine gelince giriş ve çıkış saatleri görünür. ‹ › ile önceki aylara gidebilirsiniz.
- **İzin ve resmi tatil:** PDKS izinleri bildirmediği için bunları siz işaretlersiniz. Hafta veya Ay görünümünde güne sağ tıklayıp **Tam gün izin**, **Yarım gün izin** ya da **Resmi tatil** seçin. İşaretler yalnızca bilgisayarınızda saklanır, PDKS'ye yazılmaz. Çalışma günlerini ve yarım gün iznin süresini **Ayarlar > Takvim ve izinler**'den değiştirebilirsiniz.
- **Bildirimler:** Mesai bitişinden önce bir hatırlatma ve mesai bittiğinde bir bildirim gelir; mesai bittiğinde ekranda kısa bir kutlama da gösterilir. Hepsi **Ayarlar > Bildirimler**'den kapatılabilir.
- **Duyurular:** Uygulamayla ilgili duyurular (örneğin PDKS'ye erişilemediğinde) hem bildirim olarak hem de pencerenin üstünde gösterilir. Pencerenin üstündeki duyuruyu × ile kapatabilirsiniz.

## Güncelleme

Yeni sürüm yayımlandığında bildirim gelir ve pencerenin üstünde **Güncelle** düğmesi görünür. Kurmadan önce sürümde nelerin değiştiğini görebilirsiniz; güncellemeden sonra da pencerenin üstünde bir kez "… sürümünde neler yeni" notu gösterilir. Güncelleme uygulamanın içinden kurulur; kurulum komutunu tekrar çalıştırmanız gerekmez.

## İki sürüm arasındaki farklar

Her iki sürüm de aynı işi yapar ve mesai hesabında aynı kuralları uygular. Windows'ta bulunmayan tek şey, işletim sisteminin elvermediği bir özelliktir:

- **Menü çubuğunda metin.** macOS'ta mesai bitiş saatini ya da kalan süreyi ikonun yanında gösterebilirsiniz. Windows tepsi simgesinin yanına metin yazılamadığı için bu bilgi, simgenin üzerine geldiğinizde çıkan ipucunda görünür.

## Gizlilik

- PDKS şifreniz yalnızca işletim sisteminin kendi kasasında saklanır: macOS'ta **Anahtar Zinciri**, Windows'ta **Kimlik Bilgileri Yöneticisi**. Dosyaya veya günlüğe yazılmaz.
- T.C. kimlik numarası okunmaz, saklanmaz.
- Veriler bilgisayarınızda kalır. Uygulama PDKS ve TRT kurumsal portalı ile, güncellemeleri ve duyuruları almak için de bu depoyla (GitHub) iletişim kurar; GitHub'a hiçbir kişisel bilgi gönderilmez.
- Uygulama her çalıştırma için bir kayıt dosyası tutar; son on dosya saklanır. İçinde sayfa durumları ve hata türleri vardır; kullanıcı adı, şifre, gerçek giriş-çıkış saatleri veya sayfa içeriği **yazılmaz**. Kayıt klasörünü **Ayarlar > Hakkında**'da görebilir ve değiştirebilirsiniz.

## Sorun bildirme

**Ayarlar > Hakkında > Sorun bildir** geliştiriciye bir e-posta hazırlar ve kayıt dosyasını ekler (Windows'ta kayıt dosyası Dosya Gezgini'nde seçili açılır; e-postaya sürükleyin). GitHub hesabınız varsa bu deponun [Issues](https://github.com/mucahitpuren/trt-atlas/issues) sayfasından da kayıt açabilirsiniz. Kullanıcı adı, şifre veya kimlik numarası paylaşmayın.

---

Mücahit Püren tarafından geliştirildi.
