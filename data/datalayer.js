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

  

};

module.exports = new DataLayer();
