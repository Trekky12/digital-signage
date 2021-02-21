'use strict'

const sendButtons = document.querySelectorAll('button.btn-send');
sendButtons.forEach(function (button) {

	button.addEventListener('click', function (event) {
		event.preventDefault();

		let client = button.dataset.client;
		let slideshow = button.parentElement.querySelector('select.slideshow-select').value;

		let data = { "client": client, "slideshow": slideshow };

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