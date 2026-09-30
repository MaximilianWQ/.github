# Панели профиля Novikov

Генератор живой статистики для страницы `github.com/MaximilianWQ`. Собирает
активность репозиториев (включая **приватные**) через GitHub API, рендерит
SVG-панели и коммитит их обратно в этот репозиторий. `profile/README.md`
показывает их через `<picture>`.

Основано на генераторе [mottt-hub/.github](https://github.com/mottt-hub/.github).

## Где показывается профиль

`.github/profile/README.md` отображается только у **организаций**. Личный
профиль берёт README из репозитория `MaximilianWQ/MaximilianWQ`, поэтому
workflow после рендера копирует `profile/README.md` туда. Картинки при этом
грузятся отсюда, из `raw.githubusercontent.com/MaximilianWQ/.github/main/...`.

## Токен

Встроенный `GITHUB_TOKEN` видит только этот репозиторий, поэтому нужен
**classic** PAT со скоупом **`repo`**:

1. <https://github.com/settings/tokens> → **Generate new token (classic)**,
   отметить `repo`.
2. В этом репозитории: `Settings → Secrets and variables → Actions → New
   repository secret`, имя **`PROFILE_STATS_TOKEN`**.

Тем же токеном workflow пушит README в `MaximilianWQ/MaximilianWQ`.

## Защита от утечки

Сообщения коммитов из приватных репозиториев проходят через
`tools/lib/redact.mjs` (IP, хосты, URL, e-mail, пути, ключи, `KEY=value`,
«похоже на пароль» → `•••`). `tools/test-redact.mjs` запускается в CI до
рендера. Сырые данные `tools/data.json` в `.gitignore`.

## Локальный запуск

```bash
export GITHUB_TOKEN=$(gh auth token)
node tools/test-redact.mjs   # фильтрация
node tools/fetch-data.mjs    # API  → tools/data.json
node tools/render.mjs        # data → profile/assets/*.svg
node tools/preview.mjs       # preview-dark.html / preview-light.html
```

Переменные: `OWNER_NAME` (логин, по умолчанию `MaximilianWQ`),
`DISPLAY_NAME` (надпись в баннере, по умолчанию `Novikov`). Подзаголовок
баннера — в `tools/render.mjs`, функция `renderBanner`.

Зависимостей нет — только Node 22+.
