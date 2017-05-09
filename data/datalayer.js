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
            connection.query('Select DISTINCT(ctr.idCandidate), Last, First From Candidates c Join Candidates_To_Race ctr on ctr.idCandidate = c.idCandidate Join Races r on r.idRace = ctr.idRace Join Elections e on e.idElection = r.idElection Where e.Date >=1997 Order by c.Last;', function(err, rows, fields){
                connection.release();
                callback(err,rows,fields);
            });
        });        
    }

    this.candidatesViewDetail = function(idCandidate, callback){
       pool.getConnection(function(err,connection){
            connection.query('call spCandidateView(?)', idCandidate,  function(err, rows, fields){
                connection.release();
                callback(err,rows,fields);
            });
        });          
    }

    this.updateCandidate = function(phone, fax, email, website, youtube, facebook, twitter, linkedin, candidateid, callback){
        pool.getConnection(function(err,connection){
             connection.query('call spUpdateCandidate(?,?,?,?,?,?,?,?,?)', [phone, fax, email, website, youtube, facebook, twitter, linkedin, candidateid],  function(err, rows, fields){
                 connection.release();
                 callback(err, rows,fields);
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

    this.committeesViewDetail = function(idCandidate, callback){
       pool.getConnection(function(err,connection){
            connection.query('SELECT EXTRACT(Year from Registration_Date) as Registration_Date_Year, EXTRACT(Year from Termination_Date) As Termination_Date_Year, com.* FROM election_results.Committees com Join Candidates c on c.idCandidate = com.idCandidate Where com.idCandidate = ? Order By Registration_Date ASC;', idCandidate, function(err, rows, fields){
                connection.release();
                callback(err,rows,fields);
            });
        });        
    }


  

};

module.exports = new DataLayer();
