
let mongoose = require("mongoose")

let pathSchema = new mongoose.Schema({
    path: {
        type: Array,
        unique: true
    }
})

module.exports = mongoose.model("user", pathSchema);



