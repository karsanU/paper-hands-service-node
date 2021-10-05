const express = require('express')
const app = express()
const port = process.env.PORT || 3001;
const mongoose = require('mongoose');
const {
  fork
} = require("child_process");
// connect to database 
mongoose.connect(process.env.MONGODB_URL);

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
  redditFetcher.on("error", (err) => {
    // This will be called with err being an AbortError if the controller aborts
    redditFetcher.kill()
    console.log(`killed reddit featcher`)
    throw err
  });
  redditFetcher.send(`start`);
}
// restart if something goes wrong and record the error
try {
  console.log('here')
  startRedditFetcher()
} catch {
  console.log('000')
  startRedditFetcher()
}



// start the server 
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})