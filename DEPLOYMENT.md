# 🚀 GURAY's HYPERTROPHY - Deploy Rehberi

Bu dokuman GURAY's HYPERTROPHY fitness uygulamasının web hosting ve Google Play Store'a deploy edilmesi için detaylı adımları içerir.

## 📋 Gereksinimler

### Web Hosting için
- Web sunucusu (Apache/Nginx)
- HTTPS desteği (PWA için zorunlu)
- Modern tarayıcı desteği

### Android için
- Node.js 16+
- Android Studio (SDK 33)
- Java 8+
- Google Play Console hesabı

## 🌐 Web Hosting Deploy

### 1. Dosyaları Hazırlama
```bash
# Proje dosyalarını kopyala
cp main.html /var/www/html/
cp -r js/ /var/www/html/
cp manifest.json /var/www/html/
cp sw.js /var/www/html/
cp -r icons/ /var/www/html/  # İkonları ekleyin
```

### 2. Apache Konfigürasyonu
```apache
# .htaccess dosyası
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # HTTPS zorunlu
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    # Service Worker cache kontrolü
    <Files "sw.js">
        Header set Cache-Control "no-cache, no-store, must-revalidate"
        Header set Pragma "no-cache"
        Header set Expires "0"
    </Files>
    
    # Manifest cache
    <Files "manifest.json">
        Header set Content-Type "application/manifest+json"
    </Files>
</IfModule>

# Gzip sıkıştırma
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache kontrolü
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/ico "access plus 1 year"
</IfModule>
```

### 3. Nginx Konfigürasyonu
```nginx
server {
    listen 443 ssl http2;
    server_name guraysfitness.com www.guraysfitness.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    root /var/www/html;
    index main.html;
    
    # Gzip sıkıştırma
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # Cache kontrolü
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Service Worker özel cache
    location = /sw.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # Manifest dosyası
    location = /manifest.json {
        add_header Content-Type "application/manifest+json";
    }
    
    # SPA fallback
    location / {
        try_files $uri $uri/ /main.html;
    }
}

# HTTP'den HTTPS'e yönlendir
server {
    listen 80;
    server_name guraysfitness.com www.guraysfitness.com;
    return 301 https://$server_name$request_uri;
}
```

## 📱 Android APK Oluşturma

### 1. Geliştirme Ortamını Hazırlama
```bash
# Node.js ve Cordova yükle
npm install -g cordova

# Android Studio yükle
# https://developer.android.com/studio

# Java 8 yükle
sudo apt-get install openjdk-8-jdk

# Android SDK yollarını ayarla
export ANDROID_HOME=/path/to/android-sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### 2. Build Scriptiyle APK Oluşturma
```bash
# Build scriptini çalıştır
./build-android.sh

# Manuel build
cd build-android
cordova platform add android
cordova plugin add cordova-plugin-whitelist
cordova plugin add cordova-plugin-splashscreen
# ... diğer plugin'ler
cordova build android --release
```

### 3. APK İmzalama
```bash
# Keystore oluştur (ilk kez)
keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000

# APK'yı imzala
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk alias_name

# Zipalign ile optimize et
zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk guray-fitness-release.apk
```

## 🏪 Google Play Store Yükleme

### 1. Google Play Console Hesabı
- [Google Play Console](https://play.google.com/console)'a gidin
- $25 one-time developer fee ödeyin
- Hesabınızı doğrulayın

### 2. Uygulama Oluşturma
```
1. "Create app" butonuna tıklayın
2. Uygulama detayları:
   - App name: GURAY's HYPERTROPHY
   - Default language: Turkish
   - App or game: App
   - Free or paid: Free
3. Content rating: 3+
4. Target audience: Adults
```

### 3. Store Listing Bilgileri
```
App name: GURAY's HYPERTROPHY
Short description: Natural vücut geliştirme takip uygulaması

Full description:
GURAY's HYPERTROPHY ile natural vücut geliştirme hedeflerinizi takip edin! 

🏋️‍♂️ ÖZELLİKLER:
• 5 günlük profesyonel antrenman programı
• Detaylı egzersiz kayıtları ve ilerleme takibi
• Vücut ölçüleri ve fotoğraf karşılaştırması
• Beslenme programı ve kalori takibi
• Hedef belirleme ve motivasyon sistemi
• Offline çalışma desteği
• Veri yedekleme ve dışa aktarma

🎯 KİMLER İÇİN:
• Natural bodybuilding sporcuları
• Fitness meraklıları
• Kişisel gelişim odaklı sporcular
• Sistematik antrenman yapmak isteyenler

💪 PROGRAM DETAYLARI:
• RIR (Reps in Reserve) sistemi
• Progressive overload prensibi
• Science-based yaklaşım
• Hypertrophy odaklı program

Uygulamayı indirin ve fitness yolculuğunuza hemen başlayın!
```

### 4. Grafik Varlıkları
Gerekli boyutlar:
- High-res icon: 512 x 512 px
- Feature graphic: 1024 x 500 px
- Phone screenshots: En az 2 adet, 1080 x 1920 px
- Tablet screenshots: İsteğe bağlı

### 5. App Bundle Yükleme
```bash
# AAB formatı oluştur (önerilen)
cordova build android --release -- --packageType=bundle

# Veya APK yükle
# platforms/android/app/build/outputs/apk/release/app-release.apk
```

### 6. Release Notes
```
v1.0.0 İlk Sürüm

Özellikler:
✨ 5 günlük natural bodybuilding programı
✨ Antrenman kayıtları ve ilerleme takibi
✨ Vücut ölçüleri takibi
✨ Beslenme programı
✨ Hedef belirleme sistemi
✨ Offline çalışma desteği
✨ Veri dışa aktarma özellikleri

Natural vücut geliştirme yolculuğunuza başlayın!
```

## 🔍 Test ve Doğrulama

### Web Uygulaması Test
```bash
# Lighthouse audit
npm install -g lighthouse
lighthouse https://guraysfitness.com --view

# PWA test
# Chrome DevTools > Application > Service Workers
# Chrome DevTools > Application > Manifest

# Responsive test
# Chrome DevTools > Device Mode
```

### Android Test
```bash
# Emülatörde test
cordova emulate android

# Fiziksel cihazda test
cordova run android

# Debug logları
adb logcat | grep CONSOLE
```

## 📊 Analytics ve Monitoring

### Google Analytics 4
```html
<!-- main.html içine ekle -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Firebase Integration
```javascript
// Firebase SDK
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  // Firebase config
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
```

## 🔄 Sürekli Güncelleme

### Automated Deployment
```yaml
# GitHub Actions (.github/workflows/deploy.yml)
name: Deploy to Production
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to hosting
      run: |
        rsync -avz --delete ./ user@server:/var/www/html/
        
    - name: Build Android
      run: |
        npm install -g cordova
        ./build-android.sh
        
    - name: Upload to Play Store
      uses: r0adkll/upload-google-play@v1
      with:
        serviceAccountJsonPlainText: ${{ secrets.SERVICE_ACCOUNT_JSON }}
        packageName: com.guraysfitness.hypertrophy
        releaseFiles: platforms/android/app/build/outputs/bundle/release/app-release.aab
```

### Version Management
```json
// package.json
{
  "version": "1.0.0",
  "scripts": {
    "version:patch": "npm version patch",
    "version:minor": "npm version minor",
    "version:major": "npm version major",
    "deploy": "npm run build && npm run deploy:web && npm run deploy:android"
  }
}
```

## 🚨 Güvenlik

### HTTPS Zorunlu
```javascript
// sw.js içinde
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    location.replace('https:' + window.location.href.substring(window.location.protocol.length));
}
```

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https:;
    connect-src 'self' https:;
">
```

## 📈 Performance Optimizasyonu

### Web Vitals
- **LCP**: < 2.5s (Service Worker cache)
- **FID**: < 100ms (Optimize JavaScript)
- **CLS**: < 0.1 (Fixed layouts)

### Android Optimizasyonu
```xml
<!-- config.xml -->
<preference name="AndroidLaunchMode" value="singleTop" />
<preference name="android-targetSdkVersion" value="33" />
<preference name="android-minSdkVersion" value="22" />
```

## 🎯 Go-Live Checklist

### Web Deployment
- [ ] HTTPS sertifikası yüklendi
- [ ] Service Worker çalışıyor
- [ ] PWA install prompt aktif
- [ ] Analytics yapılandırıldı
- [ ] Error tracking aktif
- [ ] Performance monitoring kuruldu

### Android Deployment
- [ ] APK/AAB imzalandı
- [ ] Play Store listing tamamlandı
- [ ] Screenshots yüklendi
- [ ] Privacy policy eklendi
- [ ] Content rating alındı
- [ ] Pre-launch report geçildi

### Post-Launch
- [ ] User feedback monitoring
- [ ] Crash reporting aktif
- [ ] Performance metrics takibi
- [ ] User acquisition tracking
- [ ] Update deployment pipeline

---

🎉 **Başarılar!** GURAY's HYPERTROPHY artık canlıda!