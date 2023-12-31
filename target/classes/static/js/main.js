'use strict'; //used for code be dynamic/declarative  


//Variables
var usernamePage = document.querySelector('#username-page');
var loged = document.querySelector('#loged');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');
var flag = true;
var stompClient = null; //our websocket
var username = null;

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
]; //used for styling


//when user click to connect 
function connect(event) {
    username = document.querySelector('#name').value.trim();//trim remove the spaces

    if(username) {
        usernamePage.classList.add('hidden');//hidden class -> hide implementation (availble in css file)
        chatPage.classList.remove('hidden'); 

        var socket = new SockJS('/chatRoomForAll');//value specified on websockets config class "registry.addEndpoint("/chatRoomForAll").withSockJS();"
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();//prevent deafult behaviour of the forum
}


function onConnected() {
    // Subscribe to the Public chat
    stompClient.subscribe('/chat/public', onMessageReceived); //call back method -> onMessageReceived

    // Tell your username to the server
    stompClient.send("/app/chatRoom.register",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )

    connectingElement.classList.add('hidden');
}


function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}


function send(event) {
    var messageContent = messageInput.value.trim();

    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            receiver:'receiver',
            type: 'CHAT'
        };

        stompClient.send("/app/chatRoom.send", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}


function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');

    if(message.type === 'JOIN') {
    	if (flag == true) {
    		var text = message.sender;
    		loged.style['background-color'] = getAvatarColor(message.sender);
        	loged.innerHTML=text;
    		flag=false;
		}    	
    	
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
    } else {
        messageElement.classList.add('chat-message');

        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);
        if(message.sender != loged.innerHTML){
        	avatarElement.style['margin-left'] = '10px';
        }

        messageElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);
/*    var messageReceiver = document.createTextNode("to:"+message.receiver);
    textElement.appendChild(messageReceiver);*/
 
    messageElement.appendChild(textElement);
    messageArea.appendChild(messageElement);

    messageArea.scrollTop = messageArea.scrollHeight;
}


function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }

    var index = Math.abs(hash % colors.length);
    return colors[index];
}


//when user click to connect 
usernameForm.addEventListener('submit', connect, true)

//used for send messages  
messageForm.addEventListener('submit', send, true)
