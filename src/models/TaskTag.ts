import mongoose = require('mongoose');


var taskTagSchema = new mongoose.Schema({
    name: String,
<<<<<<< HEAD
    sort: { type: Number, default: 0 },
=======
>>>>>>> da43ba8b333dcc25d6bb13c9739e41d25ca9588e
    createDt: { type: Date, default: Date.now }
});




export var taskTagModel = mongoose.model('TaskTag', taskTagSchema);