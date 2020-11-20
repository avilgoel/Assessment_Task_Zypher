// Schema and model for Book
const mongoose=require("mongoose");

const bookSchema=new mongoose.Schema({
	name: String,
	author: String	
});

module.exports=mongoose.model("Book",bookSchema);
