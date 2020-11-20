// Schema and model for ReadingLog
var mongoose=require("mongoose");

var readingLogSchema=new mongoose.Schema({
	
	user: { id: 	{
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
					required: [true,'Name is mandatory']
			}
		
	},
	
	event_type: {
					type: String,
					required:false,
					
				},	
	
	book : {	id: 	{
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Book',
					required: [true,'Book is mandatory']
			}
		   },
	timeStamp: {
					type: Date,
					required: [true,'Timestamp is mandatory'],
					default: Date.now()
				}
});

module.exports=mongoose.model("ReadingLog",readingLogSchema);
