const os = require('os'),
const { fork } = require('child_process');
const Reddit = require('reddit')

// initialize reddit api client 
const reddit = new Reddit({
    username: 'paper_hands_service',
    password: 'paper_hasdfsdfnds_service',
    appId: 'EHx9LGvdkEOrHg',
    appSecret: '1CdtqjksYtrTUksYykQNcDwMm2kHWA',
    userAgent: 'MyApp/1.0.0 (http://example.com)'
})

// TODO get the data from API along with headers
// TODO manage time requests, try and limit requests to once per seconds
// TODO set up a process for processing the data that is coming in  
async function get_comments() {
    try {
        const res = await reddit.get('/r/all/comments',
            {
                limit: 100,
                after: 'gye0s9o'
            })
        console.log(res.res.header)
    } catch (e) {
        console.log(e)
    }
}
get_comments()
 