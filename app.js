// Importing required modules
const bodyParser       = require("body-parser"),
	mongoose           = require('mongoose'),
	express            = require("express"),
	app                = express(),
	axios              = require('axios');
	
// Importing the models of User, Book, ReadingLog
const User              = require("./models/user"),	
	  Book              = require("./models/book"),
	  ReadingLog        = require("./models/readingLog");

// Used to seed the Database
// function seedDB()
// {
// 	ReadingLog.create({
// 			"user.id" : "5fb6b566a6c12a6f886bc38e",
// 			"book.id" : "5fb6b566a6c12a6f886bc390",
// 			event_type: "end"
			
// 		});		

// }
// seedDB();

// Connecting to MongoDB Cloud
mongoose.connect('mongodb+srv://avilgoel:S93nzMJCXA1S02uf@cluster0.sms62.mongodb.net/assessment_task?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));


// Configuration
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static("public"));

//==========================
// HOME
//==========================
// Home/Landing Page Route- User can make requests to all 3 API's via buttons available on the Home Page
app.get("/",function(req,res){	
	res.render("home");
});

// Makes Request to the required API with the corresponding input from form
app.post("/makeRequestToAPI/:num",function(req,res){

	var APIurl;
	
	// Building the API endpoint string and passing form input as parameter
	switch(Number(req.params.num))
	{
		case 1 : 
		{
			APIurl="/readingDuration/"+ req.body.id;
			break;
		}

		case 2 : 
		{
			APIurl="/totalUsers/"+  req.body.id;
			break;

		}

		case 3 :
		{
			APIurl="/totalReadingDurationDay/"+  req.body.day;
			break;

		}
	}

	res.redirect(APIurl);


});

//==========================
// API 1
//==========================
//API to find total reading duration for a given user 
app.get("/readingDuration/:userId",function(req,res){

	// Finding all ReadingLogs for given user
	ReadingLog.find({"user.id": req.params.userId},function(err,sessions){
		
		if(err || !sessions || sessions.length==0 ){
			// Error Handling
			if(!sessions || sessions.length==0 ){
				return res.status(400).json({
					status: "No User found with the given User ID",
				});
			
			}
			else{

				return res.status(400).json({
					status: "Failed to connect to Database",
					message: err
				});
				
			}			
					
	}
		else{

			// Initialise sum(total reading duration) with 0
			var sum=0;

			var minObj= {};
			var minInterval=Number.POSITIVE_INFINITY;
			var diff;
			
			// Iterating over all readingLogs with given User ID
			sessions.forEach(function(session1){
				
				minObj= {};
				minInterval=Number.POSITIVE_INFINITY;

				// For each "start", trying to find the corresponding "end"
				if(session1.event_type==="start")
				{
					
					
					sessions.forEach(function(session2){

						// Book ID should match for corresponding "start" and "end" pair
						if(session1.book.id.toString()===session2.book.id.toString())
							{						
								
								if(session2.event_type==="end")
								{
									// Timestamp of "start" should be smaller than corresponding "end"
									if(session1.timeStamp.getTime()<session2.timeStamp.getTime())
									{
										diff=session2.timeStamp.getTime()-session1.timeStamp.getTime();
										
										// The matching "end" will correspond to the minimum value of time interval found
										if(diff<minInterval)
										{
											minInterval=diff;
											minObj=session2;
										}

										
									}

								}
										
							}
					});
					
					

					// If the corresponding "end" is found, add the time interval into sum
					if(minObj)
					{					
						sum+=minInterval;
					}
					
					
				}

				
			});
			
			
			// Convert the sum, obtained in milliSeconds, to Days, Hours, Minutes, Seconds 
			var remaining;
			const time_in_days = parseInt(sum / (1000 * 3600 * 24)); 
			remaining= sum% (1000*3600*24);
		
			const time_in_hours = parseInt(remaining / (1000 * 3600)); 
			remaining= remaining% (1000* 3600);
						
			const time_in_minutes = parseInt(remaining / (1000 * 60 ));
			remaining= remaining% (1000* 60);
			
			const time_in_seconds = remaining / (1000); 
			
			const total_time= {
				days: time_in_days,
				hours: time_in_hours,
				minutes: time_in_minutes,
				seconds: time_in_seconds
			};
			
			// Returning the object with the Total Reading Time for a given User
			return res.status(200).json({
				status: "Total Reading Time for the Given User with User ID " + req.params.userId,
				message: total_time
			});

		}
	});
});

//==========================
// API 2
//==========================
//API to find total users who read the book, for a given book
app.get("/totalUsers/:bookId",function(req,res){

	// Finding all ReadingLogs for given book
	ReadingLog.find({"book.id": req.params.bookId},function(err,sessions){
		
		if(err || !sessions || sessions.length==0 ){
			// Error Handling
			if(!sessions || sessions.length==0){
				return res.status(400).json({
					status: "No Book found with the given Book ID",
				});
				
			}
			else{
				
				return res.status(400).json({
					status: "Failed to connect to Database",
					message: err
				});

			}			
					
	}
		else{

			// Initialise totalUsers (no of users who read the book) with 0
			var totalUsers=0;;

			// Initializing map to eliminate duplicacy entries of users
			var checkDuplicacy=new Map();

			var minObj= {};
			var minInterval=Number.POSITIVE_INFINITY;
			var diff;

			// Iterating over all readingLogs with given Book ID
			sessions.forEach(function(session1){
				
				minObj= {};
				minInterval=Number.POSITIVE_INFINITY;

				// For each "start", trying to find the corresponding "end"
				if(session1.event_type==="start")
				{
					sessions.forEach(function(session2){
						
						// User ID should match for corresponding "start" and "end" pair
						if(session1.user.id.toString()===session2.user.id.toString())
							{						
								
								if(session2.event_type==="end")
								{
									// Timestamp of "start" should be smaller than corresponding "end"
									if(session1.timeStamp.getTime()<session2.timeStamp.getTime())
									{
										diff=session2.timeStamp.getTime()-session1.timeStamp.getTime();
										
										// The matching "end" will correspond to the smallest value of time interval found
										if(diff<minInterval)
										{
											minInterval=diff;
											minObj=session2;
										}

										
									}

								}
										
							}
					});
					
					 // If the corresponding "end" is found, check for repetiton
					if(minObj)
					{
						// Eliminating duplicacy by checking for previous existence of the User
						if(!checkDuplicacy.has(session1.user.id.toString()))
						{
							// If previous existence not found, incrementing the no of users
							totalUsers++;

							// Marking the User as being already included in the solution, so it does not get repeated in future
							checkDuplicacy.set(session1.user.id.toString(), true);
						}
					}
					
					
				}

				
			});

			// Returning the object with the Total Users who read the book, for a given Book
			return res.status(200).json({
				status: "Total Users who read the Given Book with Book ID " + req.params.bookId,
				message: {totalUsers: totalUsers}
			});
			

		}
	});
});

//==========================
// API 3
//==========================
//API to find the Total Reading Duration for all Users, for a given day
app.get("/totalReadingDurationDay/:day",function(req,res){

	// day must be given in the format: dd-mm-yyyy
	//                          Index : 0123456789
	
	// Extracting date, month and year from the day parameter given in url
	var date = Number(req.params.day.substr(0, 2));
	var month= Number(req.params.day.substr(3, 2));
	var year=  Number(req.params.day.substr(6, 4));	

	// Since in the Date object, the month is stored from 0-11, with 0 corresponding to Jan, 1 to Feb, 
	// and similarly, 11 to Dec
	// Hence, while checking if the month is same, the given month must be decremented by 1 to yield correct results 
	month--;

	var dateCheck= date>=1 && date<=31;
	var monthCheck= month>=0 && month<=11;
	var yearCheck= year>=2000;
	if(req.params.day.length!=10 || req.params.day[2]!='-' || req.params.day[5]!='-' || !dateCheck || !monthCheck || !yearCheck )
	{
		return res.status(400).json({
			status: "Invalid date entered"			
		});	

	}

	
	
	// Finding all ReadingLogs
	ReadingLog.find({},function(err,logs){
		
		
		if(err || !logs || logs.length==0 ){
			// Error Handling
			if(!logs || logs.length==0){
				
				return res.status(400).json({
					status: "No ReadingLogs present in the Database",
				});
			}
			else{
				return res.status(400).json({
					status: "Failed to connect to Database",
					message: err
				});				

			}			
					
	}
		else{
			var sessions=[];
			
			// Saving those ReadingLogs in sessions for which the date, day and year matches to the values given to us
			for(var i=0;i<logs.length;i++)
				{
					
					if(logs[i].timeStamp.getFullYear()===year && logs[i].timeStamp.getMonth()===month && logs[i].timeStamp.getDate()===date )
						{

							sessions.push(logs[i]);
						}
				}

				// Error Handling
				if(!sessions || sessions.length==0)
				{
					return res.status(400).json({
						status: "No ReadingLogs present in the Database for the given date, so Total Reading Time is 0 for the given day",
					});
	
				}
			
			
			// Initialise sum(total reading duration for all users for a given day) with 0
			var sum=0;

			var minObj= {};
			var minInterval=Number.POSITIVE_INFINITY;
			var diff;
			
			// Iterating over all ReadingLogs with matching date, month and year
			sessions.forEach(function(session1){
				
				minObj= {};
				minInterval=Number.POSITIVE_INFINITY;

				// For each "start", trying to find the corresponding "end"
				if(session1.event_type==="start")
				{
					sessions.forEach(function(session2){

						// User ID and Book ID should match for corresponding "start" and "end" pair
						if(session1.book.id.toString()===session2.book.id.toString() && session1.user.id.toString()===session2.user.id.toString())
							{						
								
								if(session2.event_type==="end")
								{
									// Timestamp of "start" should be smaller than corresponding "end"
									if(session1.timeStamp.getTime()<session2.timeStamp.getTime())
									{
										diff=session2.timeStamp.getTime()-session1.timeStamp.getTime();
										
										// The matching "end" will correspond to the smallest value of time interval found
										if(diff<minInterval)
										{
											minInterval=diff;
											minObj=session2;
										}

										
									}

								}
										
							}
					});

					// If the corresponding "end" is found, add the time interval into sum
					if(minObj)
					{
						sum+=minInterval;
					}
					
					
				}

				
			});

			// Convert the sum, obtained in milliSeconds, to Days, Hours, Minutes, Seconds 
			var remaining;
			const time_in_days = parseInt(sum / (1000 * 3600 * 24)); 
			remaining= sum% (1000*3600*24);
		
			const time_in_hours = parseInt(remaining / (1000 * 3600)); 
			remaining= remaining% (1000* 3600);
						
			const time_in_minutes = parseInt(remaining / (1000 * 60 ));
			remaining= remaining% (1000* 60);
			
			const time_in_seconds = remaining / (1000); 
			
			const total_time= {
				days: time_in_days,
				hours: time_in_hours,
				minutes: time_in_minutes,
				seconds: time_in_seconds
			};

			// Returning the object with the Total Reading Time of all Users for a given day			
			return res.status(200).json({
				status: "Total Reading Time of all Users for the Given Day " + req.params.day,
				message: total_time
			});

			

		}
	});
});

// Starting the server
app.listen(3000,function(){
	console.log("The App Server has started...");
});