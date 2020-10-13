require('dotenv').config()
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const app = express();
const axios = require('axios').default;
const { Client } = require('pg');
const cors = require('cors')
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();

app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')

app.get('/', (req, res) => res.render('pages/index'))

app.get('/test', (req, res) => {
  console.log(process.env.DATABASE_URL);
  res.send("test")
})

app.get('/items', (req, response) => {

  client.query(`select * from items`, (err, res) => {
    if (err) throw err;
    response.send(res.rows)
  });
})

app.post('/items/add', function (req, res) {
  const item = req.body;
  client.query(`
    insert into items
    (name, buy_price, sell_price, category, quantity)
    VALUES
    (\'${item.name}\', ${item.buy_price}, ${item.sell_price}, \'${item.category}\', ${item.quantity})
  `);
  res.send(item);
})

app.get('/items/:id', (req, response) => {
  client.query(`select * from items where id = ${req.params.id}`, (err, res) => {
    if (err) throw err;
    response.send(res.rows[0]);
  });
})

app.put('/items/:id', (req, response) => {
  const item = req.body;
  client.query(`update items
                  set name=\'${item.name}\',
                  buy_price=${item.buy_price},
                  sell_price=${item.sell_price},
                  category=\'${item.category}\',
                  quantity=${item.quantity}
                where id=${req.params.id}`, (err, res) => {
    if (err) {
      throw err;
    }
    response.send(res.rows[0]);
  });
})

app.post('/items/quantity', (req, response) => {
  const item = req.body;
  client.query(`update items
                  set quantity=${item.quantity}
                where id=${item.id}`, (err, res) => {
    if (err) throw err;
    console.log(res);
    response.send(res);
  });
})

app.get('/sales', (req, response) => {
  client.query(`select * from sales`, (err, res) => {
    if (err) throw err;
    response.send(res.rows)
  });
})

app.post('/sales/purchase', (req, response) => {
  const item = req.body;
  const total = item.sell_price * item.quantity;
  const datetime = new Date();
  console.log(item);
  client.query(`
    insert into sales
    (item_id, name, buy_price, sell_price, category, quantity, total)
    VALUES
    (${item.id}, 
      \'${item.name}\', 
      ${item.buy_price},
      ${item.sell_price},
      \'${item.category}\',
      ${item.quantity},
      ${total})
    `,
    (err, res) => {
      if (err) throw err;
      response.send(item);
    });
})

app.get('/inventory', (req, response) => {

})

app.post('/login', (req, res) => {
  axios.post('https://dev-511043.okta.com/api/v1/authn', {
    username: 'alvin.xu920@gmail.com',
    password: 'L0ckd0wn'
  })
    .then(function (response) {
      console.log("data", response.data);
      res.send(response.data)
    })
    .catch(function (error) {
      console.log(error);
      res.send(error)
    });
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`))
