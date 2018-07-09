# the-pet-bay-server  
Web Development assigment  

# Requirements  
To run this project, you will need `node >= 8.11`, `npm >= 5.6` and `docker (latest)` (or opitionally set up couchdb by hand)  

# Running the project  

You have to run couchdb before runnig the project:  
`docker run -p 5984:5984 -d --name my-couchdb couchdb`  

Now you can safely start the project:  
`node index.js`  
