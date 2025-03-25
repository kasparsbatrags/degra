# Freight Android Aplikācijas Izveides Instrukcija

Šī instrukcija apraksta, kā uzģenerēt Android aplikāciju no React Native projekta "Freight".

## Projekta Konfigurācija

- Projekts izmanto Expo SDK 52 ar expo-router
- Android konfigurācija:
  - Aplikācijas ID: `lv.degra.accounting.freight`
  - Versija: 1.0.0 (versionCode 1)
  - Iespējots Hermes JavaScript dzinējs
  - Mērķa Android SDK 34 ar minimālo SDK 24
  - Java 17 ir konfigurēta būvēšanai

## Priekšnosacījumi

Lai veiksmīgi izveidotu Android aplikāciju, nepieciešams:

1. Java Development Kit (JDK) 17 (jau konfigurēts gradle.properties failā)
2. Android SDK ar build tools versiju 35.0.0
3. Android NDK versija 26.1.10909125
4. Gradle (tiks lejupielādēts automātiski)
5. Node.js un npm

## Izstrādes Versijas Izveide (Testēšanai)

Lai izveidotu izstrādes versiju, ko var instalēt ierīcē testēšanai:

```bash
# Pārejiet uz projekta direktoriju
cd native/freight

# Palaidiet Android būvēšanas komandu
npx expo run:android
```

Šī komanda:
- Izveidos JavaScript pakotni
- Kompilēs Android aplikāciju
- Instalēs to pievienotajā ierīcē vai emulatorā

## Izlaides Versijas Izveide (Izplatīšanai)

Lai izveidotu izlaides versiju, ko var izplatīt lietotājiem:

### 1. Izveidojiet parakstīšanas atslēgu (ja tādas vēl nav)

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Sekojiet norādījumiem, lai ievadītu paroli un informāciju par atslēgu.

### 2. Konfigurējiet parakstīšanu gradle failā

Rediģējiet `android/app/build.gradle` failu, lai pievienotu izlaides parakstīšanas konfigurāciju:

```gradle
signingConfigs {
    release {
        storeFile file('ceļš/uz/jūsu/keystore.keystore')
        storePassword 'jūsu-keystore-parole'
        keyAlias 'jūsu-atslēgas-alias'
        keyPassword 'jūsu-atslēgas-parole'
    }
}
```

Un atjauniniet release buildType, lai to izmantotu:

```gradle
buildTypes {
    release {
        signingConfig signingConfigs.release
        // citi iestatījumi...
    }
}
```

### 3. Ģenerējiet izlaides APK vai AAB

Lai izveidotu APK (instalējamu failu):

```bash
cd native/freight
npx expo run:android --variant release
```

Lai izveidotu Android App Bundle (Play Store publicēšanai):

```bash
cd native/freight
cd android
./gradlew bundleRelease
```

Izvades faili atradīsies:
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

## Būvējuma Testēšana

Jūs varat instalēt APK tieši savā ierīcē:

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

## Problēmu Novēršana

Ja saskaraties ar problēmām būvēšanas laikā:

1. Pārbaudiet, vai ir instalēti visi nepieciešamie rīki (JDK, Android SDK, NDK)
2. Pārliecinieties, ka Android SDK ceļš ir pareizi iestatīts
3. Mēģiniet notīrīt projektu un būvēt no jauna:

```bash
cd native/freight
cd android
./gradlew clean
cd ..
npx expo run:android
```

4. Pārbaudiet, vai nav kļūdu Metro bundler konsolē

## Papildu Resursi

- [React Native oficiālā dokumentācija](https://reactnative.dev/docs/signed-apk-android)
- [Expo dokumentācija](https://docs.expo.dev/build/setup/)
- [Android Developer dokumentācija](https://developer.android.com/studio/publish)
