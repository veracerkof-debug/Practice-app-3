#!/usr/bin/env bash
# Готовит сгенерированный Capacitor-проект android/ к роли лаунчера:
# свой нативный плагин, домашний экран (category.HOME), слушатель уведомлений для плеера.
set -euo pipefail
cd "$(dirname "$0")/.."

PKG_DIR=android/app/src/main/java/com/minimal/launcher
M=android/app/src/main/AndroidManifest.xml
mkdir -p "$PKG_DIR"
cp native/android/java/com/minimal/launcher/*.java "$PKG_DIR/"

if ! grep -q 'category.HOME' "$M"; then
  sed -i 's#<category android:name="android.intent.category.LAUNCHER" />#<category android:name="android.intent.category.LAUNCHER" />\n                <category android:name="android.intent.category.HOME" />\n                <category android:name="android.intent.category.DEFAULT" />#' "$M"
fi
if ! grep -q 'QUERY_ALL_PACKAGES' "$M"; then
  sed -i 's#<uses-permission android:name="android.permission.INTERNET" />#<uses-permission android:name="android.permission.INTERNET" />\n    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />#' "$M"
fi
if ! grep -q 'MediaListener' "$M"; then
  sed -i 's#</application>#    <service\n            android:name=".MediaListener"\n            android:exported="true"\n            android:label="@string/app_name"\n            android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE">\n            <intent-filter>\n                <action android:name="android.service.notification.NotificationListenerService" />\n            </intent-filter>\n        </service>\n    </application>#' "$M"
fi
grep -q 'category.HOME' "$M" && grep -q 'MediaListener' "$M"
echo "android: launcher setup done"
