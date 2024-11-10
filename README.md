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
```js
db.getCollection('gifts').insertOne({
    giftId: 'blueStar',
    amount: 0.02,
    numberOfPurchased: 0,
    numberOfBooked: 0,
    totalNumberOf: 1000,
    asset: 'USDT',
    title: {
        en: 'Blue Star',
        ru: 'Синяя звезда'
    }
})
```
```js
db.getCollection('gifts').insertOne({
    giftId: 'redStar',
    amount: 0.0002,
    numberOfPurchased: 0,
    numberOfBooked: 0,
    totalNumberOf: 1000,
    asset: 'TON',
    title: {
        en: 'Red Star',
        ru: 'Красная звезда'
    }
})
```
```js
db.getCollection('gifts').insertOne({
    giftId: 'greenStar',
    amount: 0.00000001,
    numberOfPurchased: 0,
    numberOfBooked: 0,
    totalNumberOf: 1000,
    asset: 'ETH',
    title: {
        en: 'Green Star',
        ru: 'Зеленая звезда'
    }
})
```