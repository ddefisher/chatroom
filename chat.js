var user_web_socket;
var user_name;

function makeSocket()
{
    user_name = window.location.search.slice(1);

    var socket_url = 'ws://www.localhost:8080/' + user_name;

    user_web_socket = new WebSocket(socket_url);

    user_web_socket.onmessage = function (event){
      
        console.log(event.data);

        var msg_object = JSON.parse(event.data);

        //msg_object can be either a chat message or a list of users
        if(msg_object.chat_msg){
         
            var chat_area = document.getElementById('chatArea');
            chat_area.innerHTML += '<b style="font-size: 18px">' + msg_object.from + '</b><br>' + msg_object.chat_msg + '<br>';
        }
        if(msg_object.users){

            var users_area = document.getElementById('users'); 
            users_area.value = ''; 
            var users_length = msg_object.users.length;
            for(var x = 0; x < users_length; x++){

            users_area.value += msg_object.users[x] + '\n';
            }
        }

        chatArea.scrollTop = chatArea.scrollHeight;
    };
}
function init()
{
    var chat_area = document.getElementById('chatArea');
    chat_area.value = '';
    makeSocket();

}
function send()
{

    var message = document.getElementById('msg').value;
    user_web_socket.send(message);
    document.getElementById('msg').value = '';
}
window.onunload = function(e) {

     
    user_web_socket.close();

    var r = new XMLHttpRequest();
    r.open("POST", "http://localhost:5000/removeUser", false);
    r.onreadystatechange = function () {
        if (r.readyState != 4 || r.status != 200) return;
    };

    var nameObj = { name : user_name }; 
    var name = JSON.stringify(nameObj);
    r.send(name);
    
    return "You have been removed from chat";

}; 
window.onkeypress = function(e) {

  if(e.keyCode === 13){
      send();
  }

};
