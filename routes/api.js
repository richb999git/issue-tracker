/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB;
var db;


module.exports = function (app) {
  
  MongoClient.connect(CONNECTION_STRING, function(err, dbase) {
    if (err) {
      console.log("databse connection error");
    } else {
      console.log("database connection ok");
      db = dbase;
     }
  }); 


      app.route('/api/issues/:project')

        .get(function (req, res){
          var project = req.params.project;
          console.log("[get]" + project);
          var queryObj = {};
          if (req.query.issue_title) { queryObj.issue_title = req.query.issue_title; }
          if (req.query.issue_text) { queryObj.issue_text = req.query.issue_text; }
          if (req.query.status_text) { queryObj.status_text = req.query.status_text; }
          if (req.query.created_by) { queryObj.created_by = req.query.created_by; }
          if (req.query.assigned_to) { queryObj.assigned_to = req.query.assigned_to; }
          if (req.query.created_on) { queryObj.created_on = req.query.created_on; }
          if (req.query.updated_on) { queryObj.updated_on = req.query.updated_on; }
          if (req.query.open) { queryObj.open = req.query.open; }
        
          try {
            
            if (req.query._id) { queryObj._id = ObjectId(req.query._id); }
          
            console.log(queryObj);
            db.collection(project).find(queryObj).toArray(function(err, data) {
              if (err) {
                console.log(err);
                res.json({error: "Error finding issues"});
              } else {
                  console.log("--", data);
                  console.log(err);
                  res.json(data);
              }
            });
          
          } catch (e) {
              console.log(e);
              res.send("could not find " + req.query._id);
            }

        })
  
        
        // need to sort out error testing
        .post(function (req, res){
          var project = req.params.project;
          var issue_title = req.body.issue_title || "";
          var issue_text = req.body.issue_text || "";
          var created_by = req.body.created_by || "";
        
          if (issue_title === "" || issue_text === "" || created_by === "") {
            console.log("required fields missing");
            res.send("required fields missing");
          } else {
              var status_text = req.body.status_text || "";
              var assigned_to = req.body.assigned_to || "";
              var created_on = new Date();
              var updated_on = created_on;
              var doc = {issue_title: issue_title, issue_text: issue_text, created_by: created_by, assigned_to: assigned_to, status_text: status_text, created_on: created_on, updated_on: updated_on, open: true};
              console.log("[post]" + project);
              db.collection(project).insertOne(doc, function (err, data) {
                if (err) {
                  console.log(err);
                  res.json({error: "Error posting issue"});
                } else {
                    console.log("--", doc._id); //the _id of the doc is set immediatley and is available immediately
                    console.log("------", data.insertedId); // insertedId is a special property equivalent to the above
                    console.log("--", data.ops[0]._id);  // ops is the returned object
                    console.log(data.ops[0]);
                    res.json(data.ops[0])
                }
              });
            
              console.log("-----------", doc._id, "-----", doc.issue_title);
            }
        })


  
        .put(function (req, res){
          var project = req.params.project;
          console.log("[put]" + project);
          var id = req.body._id || "";
          if (id !== "") {
            // test for any other body parameters . if none then return 'no updated field sent' - no update_on change
            var updateObj = {};
            if (req.body.issue_title) { updateObj.issue_title = req.body.issue_title; }
            if (req.body.issue_text) { updateObj.issue_text = req.body.issue_text; }
            if (req.body.status_text) { updateObj.status_text = req.body.status_text; }
            if (req.body.created_by) { updateObj.created_by = req.body.created_by; }
            if (req.body.assigned_to) { updateObj.assigned_to = req.body.assigned_to; }
            if (req.body.open) { updateObj.open = req.body.open; }
            
            if (Object.keys(updateObj) !== 0) { 
              updateObj.updated_on = new Date();
              var objToUpdate = { $set: updateObj };
              
              try {
                db.collection(project).updateOne({_id: ObjectId(id)}, objToUpdate, function(err, data) {
                      console.log("modified: ", data.modifiedCount);
                      if (err) {
                        console.log("error");
                        res.send("error");
                      } else  if (data.modifiedCount === 1) {                
                           console.log("successfully updated");
                           res.send("successfully updated");
                         } else {
                           console.log("could not update " + id);
                           res.send("could not update " + id);
                         }
                });
              } catch (e) {
                console.log(e);
                res.send("could not update " + id);
              }
                  
            } else {
              console.log("no updated field sent");
              res.send("no updated field sent");
            }
            
          } else {
            console.log("no id provided");
            res.send("no id provided");
          }
          
        })

  
        .delete(function (req, res){
          var project = req.params.project;
          console.log("[delete]" + project);
          var id = req.body._id;
          // If no _id is sent return '_id error', success: 'deleted '+_id, failed: 'could not delete '+_id.
          if (id) {
            
            try {
               db.collection(project).deleteOne( { _id: ObjectId(id)} , function(err, data) {
                 
                 if (err) {
                   console.log(err);
                   res.send("could not delete " + id);
                 } else if (data.deletedCount === 1) {                
                     console.log("deleted "+ id);
                     res.send("deleted "+ id);
                   } else {
                     console.log("could not delete " + id);
                     res.send("could not delete " + id);
                   }
               });
             
            } catch (e) {
                console.log(e);
                res.send("could not delete " + id);
              }

              
          } else {
            console.log("_id error");
            res.send("_id error");
          }
            
          

        });
      

    
};

