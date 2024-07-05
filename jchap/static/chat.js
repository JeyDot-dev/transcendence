const senderMessage = document.getElementById('senderMessage');

let url = `ws://${window.location.host}/ws/chat/1234/`;

const chatSocket = new WebSocket(url);

chatSocket.onopen = function(e) {
	console.log('Chat socket open');
	chatSocket.send(JSON.stringify({
		'message': 'Hello'
	}));
}

const me = JSON.parse(localStorage.getItem('user'));

chatSocket.onmessage = function(e) {
	const data = JSON.parse(e.data);
	const message = JSON.parse(data['message']);
	const type = data['type'];

	if (type == 'chat_message') {
		addMessage(message, message['message']);
	}
}

document.getElementById('sendButton').addEventListener('click', function() {
	if (senderMessage.value == '') {
		return
	}
	console.log('try: send message');
	try {
		chatSocket.send(JSON.stringify({
			'message': senderMessage.value
		}));
	} catch (error) {
		console.log("Erreur de chat: ", error);
	}
	senderMessage.value = '';
});

function addMessage(sender, message) {
	let div = document.createElement('div');
	let coreMessage = document.createElement('div');
	let img = document.createElement('img');
	let pseudo = document.createElement('p');
	let p = document.createElement('p');

	div.classList.add('chatMessage');

	div.classList.add(sender['username'] == me['username'] ? 'sender' : 'receiver');

	if (sender['profile_pic'].length == 0) {
		img.src = 'https://media.4-paws.org/1/2/6/0/1260b8bbeb9d82d5a6caaa078d5061bbf626f94e/VIER%20PFOTEN_2015-04-27_010-1927x1333-1920x1328.jpg';
	} else {
		img.src = sender['profile_pic'];
	}

	pseudo.innerText = sender['username'];
	pseudo.style.fontWeight = 'bold';

	p.innerHTML = message;

	coreMessage.classList.add('coreMessage');
	coreMessage.appendChild(pseudo);
	coreMessage.appendChild(p);

	div.appendChild(img);
	div.appendChild(coreMessage);

	document.getElementById('chatContainer').appendChild(div);
}