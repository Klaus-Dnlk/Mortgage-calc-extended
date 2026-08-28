# Firebase — короткий статус (Mortgage-calc-extended)

Особистий Firebase-проєкт. Knowledge-store = лише конспект під оцінювання.

## Фази

| Фаза | Статус |
|------|--------|
| 0–1 Auth + кабінет | Готово |
| 2 Firestore + sync + seed (~2 тижні) | Готово |
| 3 Hosting + CLI | Готово (після твого deploy) |
| 4 Cloud Tasks queue | Код готовий — потрібен Blaze + `npm run deploy:functions` |

## Фаза 4 — що зробити тобі

1. Console → **Upgrade to Blaze** (особиста картка, budget alert **$5**).
2. Термінал:

```bash
cd Mortgage-calc-extended
cd functions && npm install && cd ..
npm run deploy:functions
npm run deploy:firebase
```

3. На сайті: **/calc** → Calculate → Save → **/profile** → блок **Cloud queue** (`queued` → `completed`).

## Компетенції після успішного deploy functions

| Компетенція | Статус |
|-------------|--------|
| Access cloud (middle) | Так — CLI + Hosting + Console |
| Message queuing (senior) | Так — Cloud Tasks producer/consumer |
| Store & sync (senior) | Так — Firestore + onSnapshot + Hosting CDN |
| Cloud database (senior) | Так — Firestore + Rules |
