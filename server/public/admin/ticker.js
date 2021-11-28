'use strict'

const deleteTickerButtons = document.querySelectorAll('button.delete-ticker');
deleteTickerButtons.forEach(function (btn) {

    btn.addEventListener('click', function (event) {
        event.preventDefault();

        if (!confirm("Really delete?")) {
            return;
        }

        let ticker_id = btn.dataset.ticker;

        return fetch("/admin/tickers/delete/" + ticker_id, {
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