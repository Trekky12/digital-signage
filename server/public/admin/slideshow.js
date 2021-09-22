'use strict'

const addSlideBtn = document.querySelector('#addSlide');
const slidesWrapper = document.querySelector('#slidesWrapper');

const slideDummy = document.querySelector('#slide-template .slide');

console.log(slideDummy);

if (addSlideBtn) {
    addSlideBtn.addEventListener('click', function (event) {
        event.preventDefault();

        let slidesCount = slidesWrapper.querySelectorAll('.slide').length;

        /*let form = document.createElement("div");
        form.classList.add("form-row");
        form.classList.add("slide");

        let form_group1 = document.createElement("div");
        form_group1.classList.add("form-group");
        form_group1.classList.add("col-md-10");

        let label_url = document.createElement("label");
        label_url.innerText = "URL";

        let input_url = document.createElement("input");
        input_url.type = "text";
        input_url.classList.add("form-control");
        input_url.name = "slides[" + slidesCount + "][url]";

        form_group1.appendChild(label_url);
        form_group1.appendChild(input_url);

        let form_group2 = document.createElement("div");
        form_group2.classList.add("form-group");
        form_group2.classList.add("col-md-1");

        let label_duration = document.createElement("label");
        label_duration.innerText = "Duration";

        let input_duration = document.createElement("input");
        input_duration.type = "number";
        input_duration.classList.add("form-control");
        input_duration.name = "slides[" + slidesCount + "][duration]";

        form_group2.appendChild(label_duration);
        form_group2.appendChild(input_duration);

        let form_group3 = document.createElement("div");
        form_group3.classList.add("form-group");
        form_group3.classList.add("col-md-1");
        form_group3.classList.add("d-flex");
        form_group3.classList.add("flex-column");
        form_group3.classList.add("justify-content-end");

        let button_delete = document.createElement("button");
        button_delete.classList.add("btn");
        button_delete.classList.add("btn-danger");
        button_delete.type = "button";
        button_delete.innerText = "Delete";
        button_delete.addEventListener('click', function (event) {
            event.preventDefault();
            if (!confirm("Really delete?")) {
                return;
            }
            form.remove();
            // When a field in the middle is deleted this index is free but the highest index is still not free
            // so reindex is needed because the next element gets the index based on the child count
            reindexFields();
        });

        form_group3.appendChild(button_delete);

        form.appendChild(form_group1);
        form.appendChild(form_group2);
        form.appendChild(form_group3);
        */

        let newSlide = slideDummy.cloneNode(true);    
    
        let inputs = newSlide.querySelectorAll('input');
        inputs.forEach(function (input, idx) {
            input.setAttribute('name', input.name.replace("DUMMY", slidesCount));
            input.removeAttribute('disabled');
        });

        let buttonDelete = newSlide.querySelector('.delete-slide');
        buttonDelete.addEventListener('click', function (event) {
            event.preventDefault();
            if (!confirm("Really delete?")) {
                return;
            }
            newSlide.remove();
            // When a field in the middle is deleted this index is free but the highest index is still not free
            // so reindex is needed because the next element gets the index based on the child count
            reindexFields();
        });

        slidesWrapper.appendChild(newSlide);

    });
}


const deleteSlideButtons = document.querySelectorAll('button.delete-slide');
deleteSlideButtons.forEach(function (btn) {

    btn.addEventListener('click', function (event) {
        event.preventDefault();

        if (!confirm("Really delete?")) {
            return;
        }

        let row = btn.closest('.slide');

        let input_delete = row.querySelector('input.delete-slide-server');
        input_delete.value = 1;

        row.classList.add('d-none');

    })
});

function reindexFields() {
    let slides = slidesWrapper.querySelectorAll('.slide');
    slides.forEach(function (item, idx) {
        let fields = item.querySelectorAll('input, textarea');
        fields.forEach(function (field) {
            field.setAttribute('name', field.name.replace(/slides\[[^\]]*\]/, 'slides[' + idx + ']'));
        });
    });
}

const deleteSlideshowButtons = document.querySelectorAll('button.delete-slideshow');
deleteSlideshowButtons.forEach(function (btn) {

    btn.addEventListener('click', function (event) {
        event.preventDefault();

        if (!confirm("Really delete?")) {
            return;
        }

        let slideshow_id = btn.dataset.slideshow;
        console.log(slideshow_id);

        return fetch("/admin/slideshows/delete/" + slideshow_id, {
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

if (slidesWrapper) {
    createSortable(slidesWrapper);
}

function createSortable(element) {
    new Sortable(element, {
        scroll: true,
        swapThreshold: 0.5,
        handle: ".handle",
        draggable: ".slide",
        onUpdate: function (evt) {
            updateFields();
        },
        onAdd: function (evt) {
            updateFields();
        }
    });
}

// change input field array key
// @see https://stackoverflow.com/a/47948276
function updateFields() {
    slidesWrapper.querySelectorAll('.slide').forEach(function (item, idx) {
        item.querySelectorAll('input').forEach(function (field) {
            console.log(field);
            field.setAttribute('name', field.name.replace(/slides\[[^\]]*\]/, 'slides[' + idx + ']'));
        });
    });
}