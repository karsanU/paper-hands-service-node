const express = require('express')
const app = express()
const port = process.env.PORT || 3001;
const Stock = require('./models/stock');
const {
  fork
} = require("child_process");
// connect to database 
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/paper_hands_service_dev')


// allow cross origin requests, later set up for only the frontend site
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

// start the comment processor 
function startRedditFetcher() {
  const redditFetcher = fork("./reddit_fetcher/index.js");
  redditFetcher.send(`start`);
  redditFetcher.on("message", (msg) => {
    console.log(`restarting`)
    if (msg === "restart") {
      redditFetcher.kill()
      startRedditFetcher()
    }
  })
}
startRedditFetcher()


// start the server 
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})