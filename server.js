
var express = require('express');
var mysql = require('mysql');

/* AWS Opsworks vs local  */
var port = process.env.PORT || 8080;
var dbconfig
try {
    var dbconfig = require('opsworks'); //[1] Include database connection data
}
catch (ex) {
    dbconfig = {
        "db": {
            "host":"nodeexample.camgkttw0a4e.us-east-1.rds.amazonaws.com",
            "database":"nodeexampledb",
            "port":3306,
            "username":"opsworksuser",
            "password":"opsworksuser123"
        }
    }
}

var app = express();
var outputString = "";

app.engine('html', require('ejs').renderFile);

//[2] Get database connection data
app.locals.hostname = dbconfig.db['host'];
app.locals.username = dbconfig.db['username'];
app.locals.password = dbconfig.db['password'];
app.locals.port = dbconfig.db['port'];
app.locals.database = dbconfig.db['database'];
app.locals.connectionerror = 'successful';
app.locals.databases = '';

//[3] Connect to the Amazon RDS instance
var connection = mysql.createConnection({
    host: dbconfig.db['host'],
    user: dbconfig.db['username'],
    password: dbconfig.db['password'],
    port: dbconfig.db['port'],
    database: dbconfig.db['database']
});

console.log("DB timeout: " + dbconfig.db.timeout)

connection.connect(function(err)
{
    if (err) {
        app.locals.connectionerror = "Goddamit error on connection" + err.stack;
        return;
    }
});

// [4] Query the database
connection.query('SHOW DATABASES', function (err, results) {
    if (err) {
        app.locals.databases = err.stack;
    }
    
    if (results) {
        for (var i in results) {
            outputString = outputString + results[i].Database + ', ';
        }
        app.locals.databases = outputString.slice(0, outputString.length-2);
    }
});

connection.end();

app.get('/', function(req, res) {
    res.render('./index.html');
});

app.get('/john', function(req, res) {
    res.send("Opsworks rules");
});

app.use(express.static('public'));

// app.listen(process.env.PORT, () => {
//     //console.log("Listening on port " + process.env.PORT)
// });

app.listen(port);