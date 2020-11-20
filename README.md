# Assessment_Task_Zypher
In this API_for_Reading_Logs App, I have created the API's corresponding to the three functions:

● For a given user( userId), find his total reading duration
○ Each Duration represents ( start, end ) couple.
○ Find all couple matching this user
○ Summate the results

Route Endpoint: "/readingDuration/:userId"
The endpoint takes in as a parameter, the User ID of the given user. 
Returns readingDuration in days, hours, mins, sec

● For a given book, find its total users who read the book
○ Find the book
○ Query all users for this book
Remove duplicate entries of users

Route Endpoint: "/totalUsers/:bookId"
The endpoint takes in as a parameter, the Book ID of the given book. 
Returns the totalUsers

● Find Total Reading Duration for a given day
○ Find all Entries in a given day
○ Find all users who have read
○ Find all matching couples ( start, end) for a user and calculate duration from
difference
○ Summate values of all user

Route Endpoint: "/totalReadingDurationDay/:day"
The endpoint takes in as a parameter, the given date in the format "dd-mm-yyyy" 
Returns totalReadingDurationDay in days, hours, mins, sec

All the routings have been properly done. I have connected this application to Mongo Cloud
Database.

Any possible errors for this app have been properly handled with appropriate message being 
displayed to the user.

The required code is availabe in the <app.js> file.

To test the application, open the directory <API_for_Reading_Logs> in cmd and run the command
<node app.js> or <nodemon> in the command line, which will run the application on the local
host port 3000.
Generally, the url for the same is: "http://localhost:3000/" .
