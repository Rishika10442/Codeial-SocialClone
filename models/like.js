const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId
    },
    //this defines the objId of the liked object
    likeable:{
        type:mongoose.Schema.ObjectId,
        required:true,
        refPath:'onModel'
    },
    //this feild is used for defining the type of the liked object, sice this is a dynamic refrence
    onModel:{
        type:String,
        required:true,
        enum:['Post','Comment']
    }
},{
    timestamps:true
}) 

const Like = mongoose.model('Like',likeSchema);

module.exports = Like;