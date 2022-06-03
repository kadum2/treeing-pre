

let mongoose = require("mongoose")

let objectsSchema = new mongoose.Schema({
    path: {
        type: Array,
        unique: true
    }
})

module.exports = mongoose.model("object", objectsSchema);





