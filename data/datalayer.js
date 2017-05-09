var DataLayer = function () {
    var mysql = require("mysql");
    var config = require('../config/database.js')['connection'];
    var pool = mysql.createPool(config);

    this.getDashboard = function(callback){
       pool.getConnection(function(err,connection){
            connection.query('Select Extract(YEAR From Date) As Year, idElection from Elections Order by Year Desc;', function(err, rows, fields){
                connection.release();
                callback(err,rows,fields);
            });
        });
    }

    this.candidatesView = function(callback){
       pool.getConnection(function(err,connection){
            connection.query('Select c.Last, c.First, c.idCandidate From Candidates c Order By c.Last', function(err, rows, fields){
                connection.release();
                callback(err,rows,fields);
            });
        });        
    }

    this.candidatesViewDetail = function(callback){
       pool.getConnection(function(err,connection){
            connection.query('Select Extract(YEAR From Date) As Year, idElection from Elections Order by Year Desc;', function(err, rows, fields){
                connection.release();
                callback(err,rows,fields);
            });
        });          
    }

    this.committeesView = function(callback){
       pool.getConnection(function(err,connection){
            connection.query('Select c.Committee_Name, c.idCommittee from Committees c Order By c.Committee_Name', function(err, rows, fields){
                connection.release();
                callback(err,rows,fields);
            });
        });        
    }

  

};

module.exports = new DataLayer();
