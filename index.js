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
  const credentials = req.body.credentials;
  axios.post('https://dev-511043.okta.com/api/v1/authn', {
    username: credentials.username,
    password: credentials.password
  })
    .then(function (response) {
      res.send(response.data)
    })
    .catch(function (error) {
      console.log(error);
      res.send(error)
    });
})

app.post('/tokens', (req, res) => {
  const data = req.body;
  const headers = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  };
  const params = `code=${data.code}&grant_type=${data.grant_type}&redirect_uri=${data.redirect_uri}&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}`;
  axios.post(`${process.env.ORG_URL}/oauth2/v1/token`, params, headers)
    .then(function (response) {
      res.send(response.data)
    })
    .catch(function (error) {
      res.send(error)
    });
})

app.post('/introspect', (req, res) => {
  const data = req.body;
  const headers = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  };
  const params = `token=${data.token}&token_type_hint=${data.token_type_hint}&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}`;
  axios.post(`${process.env.ORG_URL}/oauth2/v1/introspect`, params, headers)
    .then(function (response) {
      res.send(response.data)
    })
    .catch(function (error) {
      console.log(error);
      res.send(error)
    });
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`))
