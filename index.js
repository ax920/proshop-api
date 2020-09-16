const express = require('express')
const path = require('path')
require('dotenv').config()
const PORT = process.env.PORT || 5000
const app = express();
const { Client } = require('pg');
const cors = require('cors')
const bodyParser = require('body-parser');
const { doesNotMatch } = require('assert');

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

// client.query('select * from items', (err, res) => {
//   if (err) throw err;
//   for (let row of res.rows) {
//     console.log(JSON.stringify(row));
//   }
//   console.log(JSON.stringify(res.rows))

//   client.end();
// });

app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')

app.get('/', (req, res) => res.render('pages/index'))

// app.use(function (req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'content-type');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
//   next();
// });


app.get('/test', (req, res) => {
  console.log(process.env.DATABASE_URL);
  res.send("test")
})

app.get('/items', (req, response) => {

  client.query(`select * from items`, (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
      // console.log(JSON.stringify(res.rows));
    }
    // client.end();
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

app.get('/sales', (req, response) => {
  client.query(`select * from items`, (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
      // console.log(JSON.stringify(res.rows));
    }
    // client.end();
    response.send(res.rows)
  });
})

app.get('/inventory', (req, response) => {

  // client.query('select * from inventory', (err, res) => {
  //   if (err) throw err;
  //   for (let row of res.rows) {
  //     // console.log(JSON.stringify(res.rows));
  //   }
  //   // client.end();
  //   response.send(res.rows)
  // });
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`))
