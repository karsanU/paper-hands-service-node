const os = require("os");
const {
  fork
} = require("child_process");
const Reddit = require("./reddit_api_library_altered_version.js");
const {
  performance
} = require("perf_hooks");
const Queue = require("./queue_data_structure");

// initialize reddit api client
let request_num = 0;
const reddit = new Reddit({
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
  appId: process.env.REDDIT_APP_ID,
  appSecret: process.env.REDDIT_APP_SECRET,
  userAgent: process.env.REDDIT_USER_AGENT,
});

// hard code to 4 processes for now
const cpuCount = 5 ? os.cpus().length > 5 : os.cpus().length
const child_processes = {};
// queue to keep track of which process needs to go next
processor_queue = new Queue();
// set up a process for processing the data that is coming in
function create_child_processes(cpuCount) {
  for (let core = 0; core < cpuCount; core++) {
    child_processes[core] = {
      id: core + "",
      process: fork("./reddit_fetcher/comment_processor.js"),
    };
    child_processes[core].process.on("error", (err) => {
      // This will be called with err being an AbortError if the controller aborts
      console.log(`Something went wrong with ${core}`);
    });
    child_processes[core].process.on("message", (id) => {
      // call this when process is done with the batch of comments
      processor_queue.enqueue(child_processes[id]);
    });
    processor_queue.enqueue(child_processes[core]);
    //child_processes[core + ''].send( core );
  }
}

// get the data from API along with headers
let before = "";
let before_is_working = false;
let t0;
let t1;
async function get_comments() {
  try {
    const opt =
      before && before_is_working ? {
        before,
        limit: 100,
        count: 0,
      } : {
        limit: 100,
        count: 0,
      };

    // only fetch and call the processes if we have at least one processor available
    if (processor_queue.length >= 1) {
      // call reddit api
      let sub_reddits;
      sub_reddits =
        "Investing+Stocks+Economics+StockMarket+Economy+GlobalMarkets+WallStreetBets+Options+Finance+Bitcoin+Dividends+Cryptocurrency+SecurityAnalysis+AlgoTrading+DayTrading+PennyStocks";
      // sub_reddits = "all";
      t0 = performance.now();
      const res = await reddit.get(`/r/${sub_reddits}/comments`, opt);
      t1 = performance.now();
      // console.log("The api call took " + (t1 - t0) + "milliseconds." + " We received: " + res.body.data.children.length + ' comments.')

      // we have a case where our anchor before comment has been delete
      // OR we didn't receive any comments on the last run
      let comments = res.body.data.children;
      if (
        comments.length > 0 &&
        before !== "" &&
        comments[comments.length - 1].data.name.slice(3) < before.slice(3) &&
        !before_is_working
      ) {
        let index = 0;
        let id = before.slice(3);
        // because we might have re fetched a bunch of old comments check check to see if there were actually any new ones 
        // from what we saw on the last fetch 
        while (comments[index].data.id > id) {
          index++;
        }
        comments = comments.slice(0, index);
        // console.log(`New comments: ${comments.length}`);
      }

      // update before
      console.log(request_num);
      if (comments.length > 0) {
        // console.log("before: ", comments[0].data.name, res.body.data.before,
        //     " after: ", comments[comments.length - 1].data.name, res.body.data.after)
        before = comments[0].data.name;
        before_is_working = true;
        // call the child process
        const process_ref = processor_queue.dequeue();
        process_ref.process.send({
          comments,
          id: process_ref.id
        });
        request_num++;
        // console.log(request_num)
        setTimeout(get_comments, 0);
      } else {
        before_is_working = false;
        request_num++;
        setTimeout(get_comments, 0);
      }
    } else {
      // no process is free ty again in  bit
      setTimeout(get_comments, 100);
    }
  } catch (e) {
    console.log(e);
  }
}

create_child_processes(cpuCount);
get_comments();

/*
console.log({
                    "x-ratelimit-remaining": res.header["x-ratelimit-remaining"],
                    "x-ratelimit-used": res.header["x-ratelimit-used"],
                    "x-ratelimit-reset": res.header["x-ratelimit-reset"],
                })

console.log("before: ", comments[0].data.name, res.body.data.before,
                    " after: ", comments[comments.length - 1].data.name, res.body.data.after)
   console.log("The api call took " + (t1 - t0) + "milliseconds." + " We received: " + comments.length + ' comments.')
            console.log("local before: ", before)
*/