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

	if (jsonObject.type == "client_ctrl") {
		let client_id = jsonObject.client;
		let clientRow = document.querySelector('tr[data-id="' + client_id + '"]');
		if (clientRow) {
			let pauseBtn = clientRow.querySelector('button.btn-ctrl[data-type="ctrl_pause"]');
			let playBtn = clientRow.querySelector('button.btn-ctrl[data-type="ctrl_play"]');

			if (jsonObject.value == "ctrl_pause") {
				playBtn.style.display = "inline-block";
				pauseBtn.style.display = "none";
			}
			if (jsonObject.value == "ctrl_play") {
				playBtn.style.display = "none";
				pauseBtn.style.display = "inline-block";
			}
		}
	}

	if (jsonObject.type == "client_info") {

		if (jsonObject.value == "connect") {
			window.location.reload();
		}
		if (jsonObject.value == "disconnect") {
			window.location.reload();
		}
		//console.log(jsonObject.client);
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

		return fetch("/admin/sendSlideshow", {
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

		let data = { "client": client, "admin": myWSClientID, "type": "get_url" };

		return fetch("/admin/control", {
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
		}).catch(function (error) {
			console.log(error);
		});
	});
});

const reloadButtons = document.querySelectorAll('button.btn-reload');
reloadButtons.forEach(function (button) {

	button.addEventListener('click', function (event) {
		event.preventDefault();

		let client = button.dataset.client;

		let data = { "client": client, "admin": myWSClientID, "type": "reload" };

		return fetch("/admin/control", {
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
			alert(data);
			window.location.reload();
		}).catch(function (error) {
			console.log(error);
		});
	});
});

const deleteClientGroupButtons = document.querySelectorAll('button.delete-group');
deleteClientGroupButtons.forEach(function (btn) {

	btn.addEventListener('click', function (event) {
		event.preventDefault();

		if (!confirm("Really delete?")) {
			return;
		}

		let clientgroup_id = btn.dataset.group;
		console.log(clientgroup_id);

		return fetch("/admin/group/delete/" + clientgroup_id, {
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


const sendTickerButtons = document.querySelectorAll('button.btn-send-ticker');
sendTickerButtons.forEach(function (button) {

	button.addEventListener('click', function (event) {
		event.preventDefault();

		let client = button.dataset.client;
		let group = button.dataset.group;
		let ticker = button.parentElement.parentElement.querySelector('select.ticker-select').value;

		let data = { "client": client, "group": group, "ticker": ticker };

		return fetch("/admin/sendTicker", {
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
				alert("Ticker successfully send!");
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

const ctrlButtons = document.querySelectorAll('button.btn-ctrl');
ctrlButtons.forEach(function (button) {

	button.addEventListener('click', function (event) {
		event.preventDefault();

		let client = button.dataset.client;
		let type = button.dataset.type;

		let data = { "client": client, "admin": myWSClientID, "type": type };

		return fetch("/admin/control", {
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
			alert(data);
		}).catch(function (error) {
			console.log(error);
		});
	});
});