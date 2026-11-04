# Русский язык — интерактивный учебник

Учебник русского языка для школьников: полная теория со всеми правилами и исключениями, режим «Проще», интерактивные схемы, тренажёр, упражнения в тетрадь со сложностью от ★ до ★★★★★, карточки с интервальным повторением, глоссарий, словарик правописания и умный словарь (значение, состав слова, словообразование, однокоренные, синонимы, формы).

Работает как один HTML-файл — офлайн, без сервера и зависимостей.

## Запуск

```bash
python3 tools/build.py      # → dist/index.html и www/index.html (открыть в браузере)
```

## Разработка

```bash
npm install                 # playwright для тестов
npx playwright install chromium
npm test                    # сборка + дымовой тест + проверка вёрстки (360/768/1280 px)
```

- Устройство кода и модели данных — [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Как писать главу — [docs/CONTENT-GUIDE.md](docs/CONTENT-GUIDE.md)
- Умный словарь — [docs/DICTIONARY.md](docs/DICTIONARY.md)
- Концепция и решения — [docs/PRODUCT.md](docs/PRODUCT.md)
- Планы — [docs/ROADMAP.md](docs/ROADMAP.md), идеи на обсуждение — [docs/IDEAS.md](docs/IDEAS.md)
- Источники — [docs/SOURCES.md](docs/SOURCES.md)
- Контекст для Claude Code — [CLAUDE.md](CLAUDE.md)

## Публикация

При пуше в `main` workflow `.github/workflows/pages.yml` собирает учебник и выкладывает на GitHub Pages (в настройках репозитория: Settings → Pages → Source: GitHub Actions).

## Android

Workflow `.github/workflows/android.yml` (пока только вручную: Actions → «Сборка Android APK» → Run workflow) собирает отладочный APK через Capacitor. Готовый файл — в артефакте `rus-uchebnik-debug-apk` на странице запуска.

Локально (нужны JDK 21 и Android SDK):

```bash
npm install
npm run android             # сборка + android/ (Capacitor)
cd android && ./gradlew assembleDebug
```

## Лицензии

Тексты учебника — авторские (пересказ, лицензию выбирает владелец). Словарные данные: значения и ударения — Русский Викисловарь, формы — OpenCorpora; обе — **CC BY-SA**, файлы `src/data/dictionary/` распространяются на тех же условиях.
