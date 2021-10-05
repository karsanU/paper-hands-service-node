const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stockScheme = Schema({
    createdAt: { type: Date, default: Date.now },
    message: String
});
const Comment = mongoose.model("error", stockScheme);
module.exports = Comment;