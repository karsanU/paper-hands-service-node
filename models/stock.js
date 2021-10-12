const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stockScheme = Schema({
    ticker: {
        type: String, required: true
    },
    name: { type: String, required: true },
    country: { type: String },
    IPOYear: { type: String },
    sector: { type: String },
    industry: { type: String },
    allMentions: [{ time: { type: Date, default: Date.now }, commentId: String }],
    dailyMentions: [{ date: String, count: Number }],
    hourlyMentions: [{ hour: String, count: Number }],
    fiveMinMentions: [{ fiveMin: String, count: Number }],
});

// Methods are only accessible on the instances of the model.
stockScheme.methods.populateMentions = async function (commentId) {
    const user = this;
    // time block calculations
    const date = new Date();
    const coEff5min = 1000 * 60 * 5;
    const coEff1hr = 1000 * 60 * 60;
    const coEff1day = 1000 * 60 * 60 * 24;
    const rounded5min = (new Date(Math.round(date.getTime() / coEff5min) * coEff5min)).toISOString()
    const rounded1hr = (new Date(Math.round(date.getTime() / coEff1hr) * coEff1hr)).toISOString()
    const rounded1day = (new Date(Math.round(date.getTime() / coEff1day) * coEff1day)).toISOString()
    // update time blocks
    user.allMentions.push({ commentId })
    if (user.dailyMentions[user.dailyMentions.length - 1].date === rounded1day) {
        user.dailyMentions[user.dailyMentions.length - 1].date += 1
    } else {
        user.dailyMentions.push({ date: rounded1day, count: 1 })
    }
    try {
        await this.save
    } catch (err) {
        console.log(err)
    }
};


const Comment = mongoose.model("Stock", stockScheme);
module.exports = Comment;
