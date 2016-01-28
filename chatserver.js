var http = require('http');
var url = require('url');
var fs = require('fs');
var WebSocketServer = require('ws').Server;

var users_array = [];

function serveFile(fileName,response,fileType)
{

    fs.readFile(fileName, function (err, html){
        if(err) throw err;
        response.writeHeader(200,{'content-type' : fileType,
        "Access-Control-Allow-Origin" : "*"});
        response.write(html);
        response.end();
    }); 
}
function removeUser(request,response)
{
    var dataobject = {};
    request.on('data', function(chunk) {

        dataobject = JSON.parse(chunk);
        console.log(dataobject);
    });
    request.on('end', function() {
        // empty 200 OK response for now
        response.writeHead(200, "OK", {'Content-Type': 'text/html',
        "Access-Control-Allow-Origin" : "*"});

        var index = users_array.indexOf(dataobject.name);
       
        if(index > -1){

        users_array.splice(index,1);
        }

        var users_string = JSON.stringify({ users: users_array });
        wss.clients.forEach(function each(client) {

            client.send(users_string);
        }); 
        

        response.end();
    });


}

var wss = new WebSocketServer({ port: 8080});

console.log("websocket up on port 8080");


wss.on('connection', function connection(ws) {

    //add user to user list based on url  
    users_array.push(ws.upgradeReq.url.slice(1));

    ws.on('message', function incoming(message) {

        console.log('received: ' + message);
        console.log(ws.upgradeReq.url);

        var from = ws.upgradeReq.url.slice(1);
        var message_obj = {from : from ,chat_msg : message}; 
        var message_string = JSON.stringify(message_obj);

        wss.clients.forEach(function each(client) {

            client.send(message_string);
        }); 
    });

    //messages sent when connection made
    var message_obj = { users : users_array}; 
    var message_string = JSON.stringify(message_obj);
    ws.send(message_string);

    var users_string = JSON.stringify({ users: users_array });
    wss.clients.forEach(function each(client) {

        client.send(users_string);
    }); 
});

var server = http.createServer(function(request,response){

    var urlMap = url.parse(request.url,true);

    console.log(urlMap.pathname);

    if(urlMap.pathname ==="/chat.js"){

        serveFile('chat.js',response,'application/json');
    }
    else if(urlMap.pathname ==="/chat.css"){

        serveFile('chat.css',response,'text/css');
    }
    else if(urlMap.pathname ==="/chat"){

        serveFile('chat.html',response,'text/html');
    }
    else if(urlMap.pathname ==="/removeUser"){

        removeUser(request,response);
    }
    else if(urlMap.pathname ==="/"){

        serveFile('index.html',response,'text/html');
    }
    else if(urlMap.pathname ==="/index.js"){

        serveFile('index.js',response,'application/json');
    }
});

server.listen(5000);
console.log("HTTP server up on port: 5000");

