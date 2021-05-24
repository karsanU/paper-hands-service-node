const { performance } = require('perf_hooks');
const fs = require('fs');
const readline = require('readline')
/*
    Fetch the comments given the before and process them.
    If the comment is found with a stock name push the comment info to database.
-----------------------------------------------------------------------
    Important variables from the comment datatype received from the API request.
    These values will be tracked in the database for the comment
        - parent_id : this the the post that this comment is made on
*/

// process the CSV to populate the stock names 
stock_names = {}
stock_names_read = false
let t0;
let t1;
const result = {}
function populate_stock_names(comments) {
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
        stock_names_read = true
        is_stock_name_in_comment(comments)
    }).on('error', function (err) {
        // handle errors here
        console.log(err);
    });
}

// check comments to see if stock name exits 
function is_stock_name_in_comment(comments) {
    comments.forEach((comment) => {
        (Object.keys(stock_names)).forEach((key) => {
            // if the stock name only a single char then do this  
            if (key.length == 1) {
                if (comment.data.body.includes(` $${key} `)) {
                    result[key] = Object.keys(result).includes(key) ? result[key] + 1 : 1                                                                                                                                                                                                                                        () ? result[key] + 1 : 1
                }
                // stock name is longer than one char
            } else if (comment.data.body.includes(` ${key} `) ||
                comment.data.body.includes(` $${key} `) ||
                comment.data.body.includes(` ${key}, `)
                || comment.data.body.includes(` ${key}.`)) {
                result[key] = Object.keys(result).includes(key) ? result[key] + 1 : 1
                console.log(`${key}: ${comment.data.body}`)
                console.log(`_____________________________________________`)
            }
        })
    })
    // console.log('result ', result)
}

// listen for parent's instructions
process.on('message', (data) => {
    if (stock_names_read === false) {
        populate_stock_names(data.comments)
        stock_names_read = true
    } else {
        is_stock_name_in_comment(data.comments)
    }
    // console.log((data.id))
    process.send(data.id)
});
