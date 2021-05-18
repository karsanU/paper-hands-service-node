const { performance } = require('perf_hooks');
const fs = require('fs')
const readline = require('readline')
/*
    Fetch the comments given the before and process them.
    If the comment is found with a stock name push the comment info to database.
-----------------------------------------------------------------------
    Important variables from the comment datatype received from the API request.
    These values will be tracked in the database for the comment
        - id
        - body : the actual comment
        - created
        - subreddit
        - link_url
        - parent_id : this the the post that this comment is made on
*/

// process the CSV to populate the stock names 
stock_names = {}
let t0;
let t1;
function populate_stock_names() {
    const reader = readline.createInterface({
        input: fs.createReadStream('stock_names.csv')
    });
    // this is an async function
    reader.on('line', function (line) {
        // process each line
        parsed_data = line.split(',', 2)
        stock_names[parsed_data[0]] = parsed_data[1]
    }).on('close', function () {
        // now we're done reading the file
        console.log(stock_names)
        t1 = performance.now()
        console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.")
    }).on('error', function (err) {
        // handle errors here
        console.log(err);
    });
}

t0 = performance.now()
populate_stock_names()

