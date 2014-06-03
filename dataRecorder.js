var Spreadsheet = require('edit-google-spreadsheet');
//var reloadingModule=require("./reloadingModule.js");
var fileFetcher=require("./fileFetcher.js");

var http = require('http');
var url=require('url');




http.createServer(function (req, res) {

var url_parts = url.parse(req.url, true);
var query = url_parts.query;
var rowNum=query.row;
var colNum=query.col;
Spreadsheet.load({
  debug: true,
  username: 'mingyichen95@gmail.com',
  password: 'myc95410',
  spreadsheetName: 'Cat Data',
  worksheetName: 'Sheet1'
  // spreadsheetId: 'tI1mkRABSRt3tQX3b-CRPbw',
  // worksheetId: 'od6'

}, function run(err, spreadsheet) {
  if(err) throw err;

  var oldArray=fileFetcher.sheet; 
  var value=oldArray[rowNum][colNum];
  value++;
  var newArray={};
  newArray[rowNum]={};
  newArray[rowNum][colNum]=value;
  spreadsheet.add(newArray);
  
  spreadsheet.send(function(err) {
    if(err) throw err;

//       console.log("Found rows:", );
    console.log("updated file");
   fileFetcher=require.reload("./fileFetcher.js");
  
  });
  

  
});





}).listen(1337, '128.54.186.34');
console.log('Server running at http://128.54.186.34:1337/');
