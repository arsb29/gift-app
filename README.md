# Gift App Api

Приложение позволяет покупать подарки используя платежную систему Crypto Pay (оплата через Mini App Crypto Bot), просматривать купленные подарки, дарить их пользователям используя возможности Telegram Mini App, просматривать лидерборд и профили пользователей. Приложение должно имеет два языка, светлую и темную тему

## Локальный запуск

- скопировать файл `.env.example` как `.env` и заполнить переменные
- выполнить команду `docker-compose up api`
- при первом запуске нужно подключиться к контейнеру mongo и создать суперпользователя
```js
db.createUser({
    user: "root",
    pwd: "root",
    roles: [ { role: "root", db: "admin" } ]
})
```

Скрипты для добавления подарков
```js
db.getCollection('gifts').insertOne({
    giftId: 'deliciousCake',
    amount: 0.02,
    numberOfPurchased: 0,
    numberOfBooked: 0,
    totalNumberOf: 500,
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
    amount: 0.03,
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
    amount: 0.02,
    numberOfPurchased: 0,
    numberOfBooked: 0,
    totalNumberOf: 2000,
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
    amount: 0.001,
    numberOfPurchased: 0,
    numberOfBooked: 0,
    totalNumberOf: 5000,
    asset: 'ETH',
    title: {
        en: 'Green Star',
        ru: 'Зеленая звезда'
    }
})
```
