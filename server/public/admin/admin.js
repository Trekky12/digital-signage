'use strict'

const clientsTable = document.querySelector('#clients');

  
fetch('/admin/clients', {
	method: 'GET',
	credentials: "same-origin"
}).then(function (response) {
	return response.json();
}).then(function (data) {
	
	let tbody = clientsTable.querySelector("tbody");
	tbody.innerHTML = "";
	data.forEach(function (val) {

		let tr = document.createElement("tr");

		let td_hostname = document.createElement("td");
		td_hostname.innerHTML = val['hostname'];
		tr.appendChild(td_hostname);
		
		let td_online = document.createElement("td");
		td_online.innerHTML = val['isAvailable'] ? "x" : "";
		tr.appendChild(td_online);
		
		let td_ip = document.createElement("td");
		td_ip.innerHTML = val['ip'];
		tr.appendChild(td_ip);
		
		let td_url = document.createElement("td");
		td_url.innerHTML = val['url'];
		tr.appendChild(td_url);
		
		let td_send = document.createElement("td");
		let a_send = document.createElement("a");
		a_send["href"] = "#";
		a_send.dataset.client = val['id'];
		a_send.classList.add("btn-send");
		let span_send = document.createElement("span");
		span_send.classList = "fas fa-route fa-lg";
		span_send.innerHTML = "Send URL";
		a_send.appendChild(span_send);
		td_send.appendChild(a_send);
		tr.appendChild(td_send);
		
		tbody.appendChild(tr);
	});
	
}).catch(function (error) {
	console.log(error);
});


clientsTable.addEventListener('click', function (event) {
	let send = event.target.closest('.btn-send');
	if (send) {
		event.preventDefault();
		
		let client = send.dataset.client;
		let url = prompt("Please enter the URL", "");
		if (url != null) {
			let data = {"client": client, "url": url};
			
			// send new url
			return fetch("/admin/send", {
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
				if(data == "success"){
					window.location.reload();
				}else{
					console.log(data);
					alert(data);
				}
			}).catch(function (error) {
				console.log(error);
			});
		}
	}
});