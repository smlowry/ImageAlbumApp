// api/users.js

// Sprint-3 TO DO: 

//1. Modify database to support images that belong to a particular user.

//2. Design a user specific home page that displays only the images for that user.

//3. Display the images shown on the home page as thumbnails. Organized with a section of most recent images. Outside the most recent section, the images should be organized by date taken.

//4. Allow the user access to the their home page only if they have been authenticated. (ie. only if they have logged in)

const jwt = require("jwt-simple");
const User = require("../models/user");
const router = require("express").Router();
const bcrypt = require("bcrypt-nodejs");
const bodyParser = require("body-parser");
const fs = require("fs");
const crypto = require("crypto")
const config = require("../configuration/config.json")

const DEBUG = false;

var secret = config.secret;
router.use(bodyParser.json())

//use urlencoded because we are posting form data
//router.use(bodyParser.urlencoded({extended: true}));

// Add a new user to the database
router.post("/users", (req, res)=> {
    
    User.findOne({uid: {$eq: req.body.username}}, (err, user)=> {
         if(err) { 
             return res.status(500).json({error: "Server Error." });
        }
      if (user !== null) {
          if (DEBUG) {
              console.log("Duplicate Check - Duplicate user found: " + req.body.username);
          }
         // Username already in the database
         res.status(409).json({ error: "Username already exists"});
      }
      else {
          if (DEBUG) { 
              console.log("User: " + req.body.username);
              console.log("Password: " + req.body.password);
              console.log("Name: " + req.body.full_name);
          }
        //create a hash for the submitted password
        bcrypt.hash(req.body.password, null, null, (err, hash) => {  
    
        var newUser = new User({
            //change from uid to username?
          uid: req.body.username,
          password: hash,
          full_name: req.body.full_name,
          date_created: new Date()
       });
        // create the users image storage
        if (DEBUG)
            console.log("New user: " + newUser.uid);
        let usrDir = crypto.createHash('sha256').update(newUser.uid).digest("hex");
        
        if (DEBUG)
            console.log("making dir: " + userDir + " for user " + newUSer.uid);
            
            let newDir = "public/images/" + usrDir;
         fs.mkdir(newDir, (err) =>{
            if (err) {
                if (DEBUG)
                    console.log('new directory not created');
                return res.status(400).json({error: "Directory for " + newUser.uid + " not created"});
            }
            if (DEBUG)
                console.log("Directory created");
            //make the thumbnail subdirectory
            let subdir = newDir + "/thumbs";
            if (DEBUG)
                console.log("making thumbs directory")
            fs.mkdir(subdir, (err)=> {
                if(err) {
                    if (DEBUG)
                        console.log("thumbs subdirectory not created");
                    return res.status(400).json({error: "thumbs subdirectory not created"});
                }
                if (DEBUG)
                    console.log("thumbs subdirectory created");
                
                //assert: both directories are created
                //save the user
                 newuser.save((err) => {
                         if (err) {
                             return res.status(500).json({error: "Server Error"});
                         }
                         res.sendStatus(201).json({success: "User created."}) ;  // Created
                      });
                    });
                });
        });
      }
    });
 
}); 

module.exports = router;