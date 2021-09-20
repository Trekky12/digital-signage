'use strict'

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const server = urlParams.has("server") ? urlParams.get('server') : window.location.hostname;
const port = urlParams.has("port") ? urlParams.get('port') : "3001";

var ws = new WebSocket("ws://" + server + ":" + port + "?type=admin");

let myWSClientID = null;

ws.onmessage = function (evt) {
	var jsonObject = JSON.parse(evt.data);
	if (jsonObject.type == "id") {
		myWSClientID = jsonObject.id;
	}
	if (jsonObject.type == "get_url_result") {
		alert(jsonObject.value);
	}
};

ws.onerror = function (err) {
	ws.close();
};

const sendButtons = document.querySelectorAll('button.btn-send');
sendButtons.forEach(function (button) {

	button.addEventListener('click', function (event) {
		event.preventDefault();

		let client = button.dataset.client;
		let group = button.dataset.group;
		let slideshow = button.parentElement.parentElement.querySelector('select.slideshow-select').value;

		let data = { "client": client, "group": group, "slideshow": slideshow };

		return fetch("/admin/sendURL", {
			method: 'POST',
			credentials: "same-origin",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		}).then(function (response) {
			return response.json();
		}).then(function (data) {
			if (data == "success") {
				alert("Slideshow successfully send!");
				window.location.reload();
			} else {
				console.log(data);
				alert(data);
				window.location.reload();
			}
		}).catch(function (error) {
			console.log(error);
		});
	});
});

const getButtons = document.querySelectorAll('button.btn-get');
getButtons.forEach(function (button) {

	button.addEventListener('click', function (event) {
		event.preventDefault();

		let client = button.dataset.client;

		let data = { "client": client, "admin": myWSClientID };

		return fetch("/admin/getURL", {
			method: 'POST',
			credentials: "same-origin",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		}).then(function (response) {
			return response.json();
		}).then(function (data) {
			if (data == "success") {
				window.location.reload();
			} else {
				console.log(data);
				alert(data);
			}
		}).catch(function (error) {
			console.log(error);
		});
	});
});

const deleteClientGroupButtons = document.querySelectorAll('button.delete-group');
deleteClientGroupButtons.forEach(function(btn){

    btn.addEventListener('click', function(event){
        event.preventDefault();

        if(!confirm("Really delete?")){
            return;
        }
        
        let clientgroup_id = btn.dataset.group;
        console.log(clientgroup_id);

        return fetch("/admin/group/delete/"+clientgroup_id, {
			method: 'GET'
		}).then(function (response) {
			return response.json();
		}).then(function (data) {
			if (data == "success") {
				window.location.reload();
			} else {
				console.log(data);
				alert(data);
			}
		}).catch(function (error) {
			console.log(error);
		});        

    })
});