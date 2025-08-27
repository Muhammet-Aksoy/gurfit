#!/bin/bash

# GURAY's HYPERTROPHY Android Build Script
# Bu script PWA'yı Android uygulamasına dönüştürür

echo "🏋️ GURAY's HYPERTROPHY Android Build Script"
echo "============================================="

# Renklendirme için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Hata kontrolü
set -e

# Gerekli araçların kontrolü
echo -e "${BLUE}📋 Gerekli araçlar kontrol ediliyor...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js bulunamadı. Lütfen Node.js yükleyin.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm bulunamadı. Lütfen npm yükleyin.${NC}"
    exit 1
fi

if ! command -v cordova &> /dev/null; then
    echo -e "${YELLOW}⚠️ Cordova bulunamadı. Yükleniyor...${NC}"
    npm install -g cordova
fi

echo -e "${GREEN}✅ Tüm gerekli araçlar mevcut${NC}"

# Proje dizinini oluştur
echo -e "${BLUE}📁 Proje dizini hazırlanıyor...${NC}"

BUILD_DIR="build-android"
if [ -d "$BUILD_DIR" ]; then
    echo -e "${YELLOW}⚠️ Mevcut build dizini temizleniyor...${NC}"
    rm -rf "$BUILD_DIR"
fi

mkdir "$BUILD_DIR"
cd "$BUILD_DIR"

# Cordova projesi oluştur
echo -e "${BLUE}🔧 Cordova projesi oluşturuluyor...${NC}"
cordova create . com.guraysfitness.hypertrophy "GURAY's HYPERTROPHY"

# Platform ekle
echo -e "${BLUE}📱 Android platformu ekleniyor...${NC}"
cordova platform add android

# Web dosyalarını kopyala
echo -e "${BLUE}📂 Web dosyaları kopyalanıyor...${NC}"
cp ../main.html www/
cp -r ../js www/
cp ../manifest.json www/
cp ../sw.js www/

# İkon klasörü oluştur (boş ikonlar)
mkdir -p www/icons
echo -e "${YELLOW}ℹ️ İkonlar manuel olarak www/icons/ klasörüne eklenmelidir${NC}"

# Config.xml'i güncelle
echo -e "${BLUE}⚙️ Cordova yapılandırması güncelleniyor...${NC}"
cp ../android/config.xml .

# Plugin'leri yükle
echo -e "${BLUE}🔌 Gerekli plugin'ler yükleniyor...${NC}"
cordova plugin add cordova-plugin-whitelist
cordova plugin add cordova-plugin-splashscreen
cordova plugin add cordova-plugin-statusbar
cordova plugin add cordova-plugin-device
cordova plugin add cordova-plugin-vibration
cordova plugin add cordova-plugin-file
cordova plugin add cordova-plugin-camera
cordova plugin add cordova-plugin-network-information
cordova plugin add cordova-plugin-dialogs
cordova plugin add cordova-plugin-inappbrowser

# Requirements kontrolü
echo -e "${BLUE}📋 Android geliştirme ortamı kontrol ediliyor...${NC}"
cordova requirements android || {
    echo -e "${RED}❌ Android geliştirme ortamı eksik!${NC}"
    echo -e "${YELLOW}Gereksinimler:${NC}"
    echo "1. Android Studio (SDK 33)"
    echo "2. Java 8 veya üzeri"
    echo "3. Gradle"
    echo ""
    echo -e "${BLUE}Detaylar: https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html${NC}"
    exit 1
}

# Debug build
echo -e "${BLUE}🔨 Debug APK oluşturuluyor...${NC}"
cordova build android --debug

# Release build (isteğe bağlı)
echo -e "${BLUE}❓ Release APK oluşturulsun mu? (y/N)${NC}"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🔨 Release APK oluşturuluyor...${NC}"
    cordova build android --release
    
    echo -e "${YELLOW}⚠️ Release APK imzalanması gerekiyor!${NC}"
    echo "Detaylar: https://developer.android.com/studio/publish/app-signing"
fi

# Sonuçları göster
echo -e "${GREEN}🎉 Build işlemi tamamlandı!${NC}"
echo ""
echo "📍 APK dosyaları:"
echo "  Debug: platforms/android/app/build/outputs/apk/debug/app-debug.apk"
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "  Release: platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk"
fi
echo ""
echo "📱 Test etmek için:"
echo "  cordova run android"
echo ""
echo "📤 Play Store'a yüklemek için:"
echo "1. Release APK'yı imzalayın"
echo "2. Google Play Console'a yükleyin"
echo "3. Uygulama detaylarını doldurun"
echo ""
echo -e "${GREEN}✨ GURAY's HYPERTROPHY Android uygulaması hazır!${NC}"

# APK boyutunu göster
if [ -f "platforms/android/app/build/outputs/apk/debug/app-debug.apk" ]; then
    APK_SIZE=$(ls -lh platforms/android/app/build/outputs/apk/debug/app-debug.apk | awk '{print $5}')
    echo -e "${BLUE}📏 APK boyutu: ${APK_SIZE}${NC}"
fi

# Test cihazı varsa kurulum önerisi
echo ""
echo -e "${BLUE}💡 İpuçları:${NC}"
echo "• Test cihazınız bağlıysa: cordova run android"
echo "• Emülatörde test etmek için: cordova emulate android"
echo "• Canlı reload için: cordova run android --live-reload"
echo "• Logları görmek için: adb logcat | grep CONSOLE"

cd ..

echo -e "${GREEN}🏁 İşlem tamamlandı!${NC}"