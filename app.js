const express = require('express')
const app = express()
const port = process.env.PORT || 3001;
const mongoose = require('mongoose');
try {
  mongoose.connect(process.env.MONGODB_URL);
} catch {
  console.log(mongoose.connection.readyState);
}

const Cat = mongoose.model('Cat', { name: String });
const kitty = new Cat({ name: 'Zildjian' });
kitty.save().then(() => console.log('meow'));

// CROSS
var allowCrossDomain = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type ,  Authorization,");
  next();
};
app.use(allowCrossDomain);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})