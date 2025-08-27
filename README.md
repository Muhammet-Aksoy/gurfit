# GURAY's HYPERTROPHY Fitness Takip Uygulaması 🏋️‍♂️

Natural vücut geliştirme ve antrenman takip uygulaması. Modern web teknolojileri kullanılarak geliştirilmiş, offline çalışabilen, mobil uyumlu fitness uygulaması.

## 🌟 Özellikler

### ✅ Tamamlanan Özellikler
- **💾 Veri Kalıcılığı**: IndexedDB ve localStorage ile veri saklama
- **📱 Antrenman Takibi**: Günlük antrenman programları ve tamamlama durumu
- **🏃‍♂️ Egzersiz Kayıtları**: Detaylı set, ağırlık ve tekrar takibi
- **📊 İlerleme Grafikleri**: Chart.js ile görsel ilerleme takibi
- **🥗 Beslenme Takibi**: Günlük kalori ve makro besin takibi
- **📏 Vücut Ölçüleri**: Periyodik vücut ölçümü kaydetme
- **🎯 Hedef Belirleme**: Kişisel fitness hedefleri ve ilerleme takibi
- **📅 Takvim Görünümü**: Aylık, yıllık ve günlük takvim görünümleri
- **📤 Veri Dışa Aktarma**: CSV formatında veri dışa aktarma
- **💿 Yedekleme/Geri Yükleme**: JSON formatında tam veri yedekleme
- **📱 PWA Desteği**: Offline çalışma ve ana ekrana ekleme
- **🔔 Bildirimler**: İnteraktif bildirim sistemi
- **📱 Android Uygulaması**: Cordova ile native Android uygulaması

### 🎨 Kullanıcı Arayüzü
- **🌙 Modern Dark Theme**: Göz yormayan karanlık tema
- **📱 Responsive Tasarım**: Tüm cihazlarda uyumlu
- **🎨 Animasyonlar**: Yumuşak geçişler ve hover efektleri
- **⚡ Hızlı Navigasyon**: Tab-based navigasyon sistemi

### 🏋️‍♂️ Antrenman Programı
- **5 Günlük Split Program**: Profesyonel natural bodybuilding programı
- **📋 Detaylı Egzersiz Bilgileri**: RIR, failure, beyond failure açıklamaları
- **🎯 İlerleme Takibi**: Set, ağırlık ve tekrar geçmişi
- **📊 Performans Grafikleri**: Bench press ve squat gelişim grafikleri

## 🚀 Kurulum

### Web Uygulaması
1. Dosyaları web sunucusuna yükleyin
2. `main.html` dosyasını açın
3. PWA olarak yüklemek için tarayıcı önerisini kabul edin

### Android Uygulaması

#### Gereksinimler
- Node.js (v16 veya üzeri)
- Android Studio
- Java 8+
- Cordova CLI

#### Kurulum Adımları
```bash
# Gerekli araçları yükleyin
npm install -g cordova

# Build scriptini çalıştırın
./build-android.sh

# Veya manuel olarak:
cd build-android
cordova platform add android
cordova build android
```

#### APK Oluşturma
```bash
# Debug APK
cordova build android --debug

# Release APK (imzalanması gerekir)
cordova build android --release
```

## 📱 PWA Yükleme

### Android
1. Chrome'da uygulamayı açın
2. "Ana ekrana ekle" seçeneğini tıklayın
3. Uygulama ana ekranda görünecek

### iOS
1. Safari'de uygulamayı açın
2. Paylaş butonuna tıklayın
3. "Ana Ekrana Ekle" seçeneğini seçin

## 🛠️ Geliştirme

### Proje Yapısı
```
/
├── main.html              # Ana HTML dosyası
├── manifest.json          # PWA manifest
├── sw.js                  # Service Worker
├── js/
│   ├── data-manager.js    # Veri yönetimi
│   └── fitness-app.js     # Ana uygulama mantığı
├── android/               # Android özel dosyalar
├── icons/                 # Uygulama ikonları
└── build-android.sh       # Android build scripti
```

### Teknolojiler
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Veritabanı**: IndexedDB, localStorage
- **Grafikler**: Chart.js
- **PWA**: Service Worker, Web App Manifest
- **Mobile**: Cordova/PhoneGap
- **Styling**: Modern CSS Grid, Flexbox

### Veri Yönetimi
- **IndexedDB**: Ana veri saklama (antrenmanlar, ölçümler, hedefler)
- **localStorage**: Kullanıcı ayarları ve tercihler
- **Offline Support**: Service Worker ile tam offline destek

## 📊 Veri Modeli

### Antrenman Kayıtları
```javascript
{
  id: 1,
  exercise: "Bench Press",
  date: "2025-01-07",
  sets: [
    { weight: 80, reps: 8 },
    { weight: 85, reps: 6 }
  ],
  notes: "İyi antrenman",
  timestamp: 1641556800000
}
```

### Vücut Ölçüleri
```javascript
{
  id: 1,
  date: "2025-01-07",
  chest: 105,
  arm: 38,
  waist: 85,
  hip: 95,
  leg: 60,
  calf: 38,
  timestamp: 1641556800000
}
```

### Hedefler
```javascript
{
  id: 1,
  name: "Bench Press 100kg",
  currentValue: 85,
  targetValue: 100,
  progress: 85,
  created: "2025-01-07T00:00:00.000Z"
}
```

## 🔧 API Referansı

### DataManager Sınıfı
```javascript
// Antrenman kaydı ekleme
await dataManager.addWorkoutLog(workoutData);

// Ölçüm ekleme
await dataManager.addMeasurement(measurementData);

// Hedef ekleme
await dataManager.addGoal(goalData);

// Veri dışa aktarma
await dataManager.exportDataToCSV('workouts');

// Yedekleme
await dataManager.backupData();
```

## 🚀 Play Store'a Yükleme

### 1. APK Hazırlama
```bash
# Release APK oluştur
cordova build android --release

# APK'yı imzala
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore app-release-unsigned.apk alias_name

# zipalign ile optimize et
zipalign -v 4 app-release-unsigned.apk app-release.apk
```

### 2. Google Play Console
1. [Google Play Console](https://play.google.com/console)'a giriş yapın
2. "Uygulama oluştur" butonuna tıklayın
3. Uygulama detaylarını doldurun
4. APK'yı yükleyin
5. Store listeleme bilgilerini ekleyin
6. İnceleme için gönderin

### 3. Gerekli Bilgiler
- Uygulama ismi: "GURAY's HYPERTROPHY"
- Kategori: Health & Fitness
- Açıklama: Natural vücut geliştirme takip uygulaması
- Anahtar kelimeler: fitness, bodybuilding, workout, training
- Yaş sınırı: 3+

## 🔄 Güncelleme Süreci

### Web Uygulaması
1. Dosyaları güncelleyin
2. Service Worker cache sürümünü artırın
3. Kullanıcılar otomatik güncelleme alacak

### Android Uygulaması
1. `android/config.xml`'de version kodunu artırın
2. Yeni APK oluşturun
3. Play Store'a yükleyin

## 🐛 Sorun Giderme

### Veri Kaybı
- Tarayıcı depolaması temizlenirse veriler kaybolabilir
- Düzenli yedekleme yapın
- Export özelliğini kullanın

### Android Build Hataları
```bash
# Cache temizle
cordova clean android

# Platform'u yeniden ekle
cordova platform remove android
cordova platform add android

# Plugin'leri yeniden yükle
cordova plugin list
cordova plugin remove <plugin_name>
cordova plugin add <plugin_name>
```

### Performans Sorunları
- Eski kayıtları arşivleyin
- Tarayıcı cache'ini temizleyin
- Service Worker'ı güncelleyin

## 📄 Lisans

MIT License - Kişisel ve ticari kullanım için ücretsiz.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Commit edin (`git commit -am 'Yeni özellik eklendi'`)
4. Push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request oluşturun

## 📞 Destek

- **GitHub Issues**: Hata raporları ve özellik istekleri
- **Email**: support@guraysfitness.com
- **Website**: https://www.guraysfitness.com

## 🎯 Roadmap

### v1.1 (Gelecek Sürüm)
- [ ] Backend API entegrasyonu
- [ ] Sosyal paylaşım özellikleri
- [ ] Antrenman videoları
- [ ] AI destekli form analizi
- [ ] Apple Watch entegrasyonu
- [ ] Multi-dil desteği

### v1.2
- [ ] Beslenme önerileri
- [ ] Suplement takibi
- [ ] Antrenman partneri bulma
- [ ] Canlı antrenman koçluğu

---

**GURAY's HYPERTROPHY** - Natural vücut geliştirme yolculuğunuzda yanınızda! 💪