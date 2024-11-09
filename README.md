## Запуск через docker-compose

Локальный запуск
```bash
docker-compose up api
```

Для прода
```bash
docker-compose up api-prod
```

Останавливает и удаляет текущие контейнеры
```bash
docker-compose down
```

Скрипт для добавления подарка
```js
db.getCollection('gifts').insertOne({
    giftId: 'deliciousCake',
    amount: 0.02,
    numberOfPurchased: 0,
    numberOfBooked: 0,
    totalNumberOf: 1000,
    asset: 'USDT',
    title: {
        en: 'Delicious Cake',
        ru: 'Вкусный торт'
    }
})
```
