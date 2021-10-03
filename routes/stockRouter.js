const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stockScheme = Schema({
    ticker: String,
    name: String,
    allMentions: [{ time: { type: Date, default: Date.now }, commentId: String }],
    dailyMentions: [{ date: String, count: Number }],
    hourlyMentions: [{ hour: String, count: Number }],
    fiveMinMentions: [{ fiveMin: String, count: Number }],
});
const Comment = mongoose.model("Stock", stockScheme);
module.exports = Comment;