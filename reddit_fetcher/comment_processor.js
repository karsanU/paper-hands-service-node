const { performance } = require("perf_hooks");
const abbr = require("./abbr");
const fs = require("fs");
const readline = require("readline");
const Stock = require("../models/stock");
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/paper_hands_service_dev')


/*
    Fetch the comments given the before and process them.
    If the comment is found with a stock name push the comment info to database.
-----------------------------------------------------------------------
    Important variables from the comment datatype received from the API request.
    These values will be tracked in the database for the comment.
        - parent_id : this the the post that this comment is made on
*/

/*
TODO use regex
TODO fuzzy matching
TODO edge cases: plurals, currencies, mapping crypto  
*/

// process the CSV to populate the stock names
stock_names = {};
black_list_stock_names = abbr.map(function (e) {
  return e.toUpperCase();
});
stock_names_read = false;
const result = {};

/*
Read a list popular english words add the words under 4 letters to the ban list.
These banned symbols must have a '$' in front as these words can be used out side the stock market context often. 
*/
function populate_ban_list(comments) {
  const reader = readline.createInterface({
    input: fs.createReadStream("./reddit_fetcher/5000-words.txt"),
  });
  // this is an async function
  reader
    .on("line", function (word) {
      if (word.length <= 4) {
        if (!/[^a-zA-Z]/.test(word)) {
          black_list_stock_names.push(word.toUpperCase());
        }
      }
    })
    .on("close", function () {
      // now we're done reading the file
      stock_names_read = true;
      is_stock_name_in_comment(comments);
    })
    .on("error", function (err) {
      // handle errors here
      console.log(err);
    });
}

/*
Read a list of files to get the stock names. 
*/
function populate_stock_names(comments) {
  const reader = readline.createInterface({
    input: fs.createReadStream("./reddit_fetcher/stock_names.csv"),
  });
  // this is an async function
  reader
    .on("line", function (line) {
      // process each line
      parsed_data = line.split(",", 11);
      if (
        !black_list_stock_names.includes(parsed_data[0]) &&
        !parsed_data[0].includes(`^`)
      ) {
        stock_names[parsed_data[0]] = parsed_data;
      }
    })
    .on("close", function () {
      // now we're done reading the file
      populate_ban_list(comments);
    })
    .on("error", function (err) {
      // handle errors here
      console.log(err);
    });
}

// check comments to see if stock name exits
function is_stock_name_in_comment(comments) {
  comments.forEach((comment) => {
    Object.keys(stock_names).forEach((key) => {
      let stock_symbol;
      // if the stock name is in the ban list, it must include a `$` before it
      if (key.length == 1 || black_list_stock_names.includes(key)) {
        stock_symbol = "$" + key;
      } else {
        stock_symbol = "" + key;
      }

      // if the stock name only a single char then do this
      // adding the empty " " to prevent edge case
      const _comment = " " + comment.data.body;
      if (_comment.includes(`${stock_symbol}`)) {
        if (
          _comment.includes(` ${stock_symbol} `) ||
          _comment.includes(` ${stock_symbol}, `) ||
          _comment.includes(` ${stock_symbol}.`)
        ) {
          result[stock_symbol] = Object.keys(result).includes(stock_symbol)
            ? result[stock_symbol] + 1
            : 1;
          // console.log(`${stock_symbol}: ${comment.data.body}`);
          // console.log(`_____________________________________________`);
          (async () => {
            try {
              let stock
              stock = await Stock.findOne({ ticker: stock_symbol });
              if (stock === null) {
                const stock_data = {
                  ticker: stock_symbol,
                  name: stock_names[stock_symbol][1],
                }
                if (stock_names[6] !== "") stock_data['country'] = stock_names[stock_symbol][6]
                if (stock_names[7] !== "") stock_data['IPOYear'] = stock_names[stock_symbol][7]
                if (stock_names[9] !== "") stock_data['sector'] = stock_names[stock_symbol][9]
                if (stock_names[10] !== "") stock_data['industry'] = stock_names[stock_symbol][10]
                stock = await new Stock({ ...stock_data }
                )
              }
              await stock.save()
              await stock.populateMentions(comment.data.name)
              //console.log(`${stock_symbol}: ${comment.data.body}`);
            } catch (err) {
              console.log(err)
            }
          }
          )()


        }
      }
    });
  });
  // console.log('result ', result)
}

// listen for parent's instructions
process.on("message", (data) => {
  if (stock_names_read === false) {
    populate_stock_names(data.comments);
    stock_names_read = true;
  } else {
    is_stock_name_in_comment(data.comments);
  }
  // console.log((data.id))
  process.send(data.id);
});
