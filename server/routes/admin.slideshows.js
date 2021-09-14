'use strict';

const express = require('express'),
    router = express.Router(),
    Slideshow = require('../models/slideshow.model'),
    Slide = require('../models/slide.model'),
    moment = require('moment');

//router.use(express.static('public/admin/slideshows'));

router.get('/', function (req, res) {
    return Slideshow.findAll().then(function (slideshows) {
        return res.render('admin/slideshows/index', { slideshows: slideshows, moment: moment });
    })
});

/**
 * Create
 */
router.get('/create', function (req, res) {
    return res.render('admin/slideshows/edit');
});

router.post('/create', async function (req, res) {
    let name = req.body.name;

    // Create the slideshow
    const slideshow = await Slideshow.create({
        name: name
    });

    // save the slides
    let slides = req.body.slides;
    if (slides) {
        slides.forEach(async function (slide) {
            await Slide.create({
                url: slide.url,
                duration: slide.duration,
                slideshowId: slideshow.id
            })
        });
    }

    return res.redirect('/admin/slideshows/')
});

/**
 * Update
 */
router.get('/edit/:id', async function (req, res) {
    const slideshow = await Slideshow.findByPk(req.params.id, { include: ["slides"] });
    if (slideshow !== null) {
        return res.render('admin/slideshows/edit', { entry: slideshow });
    }
    return res.redirect('/admin/slideshows/')
});
router.post('/edit/:id', async function (req, res) {

    let slideshowID = req.params.id;

    // save the slideshow
    let name = req.body.name;
    const slideshow = await Slideshow.findByPk(slideshowID);
    if (slideshow !== null) {
        await slideshow.update({
            name: name,
            lastChange: new Date()
        })
    }

    // save the slides
    let slides = req.body.slides;
    if (slides) {
        slides.forEach(async function (slide) {

            let createNew = true;

            // Delete this saved slide
            if (slide.delete > 0 && typeof (slide.id) !== 'undefined') {
                const slideSaved = await Slide.findByPk(slide.id);
                if (slideSaved !== null) {
                    slideSaved.destroy();
                }
                createNew = false;
            }

            // Update or create 
            if (slide.delete == 0 && typeof (slide.id) !== 'undefined') {
                const slideSaved = await Slide.findByPk(slide.id);
                if (slideSaved !== null) {
                    await slideSaved.update({
                        url: slide.url,
                        duration: slide.duration
                    })
                    createNew = false;
                }
            }

            if (createNew) {
                await Slide.create({
                    url: slide.url,
                    duration: slide.duration,
                    slideshowId: slideshowID
                })
            }
        });
    }

    return res.redirect('/admin/slideshows/')
});

/**
 * Delete
 */
router.get('/delete/:id', async function (req, res) {
    let msg = "Error when deleting!";
    
    let result = await Slideshow.destroy({
        where: {
            id: req.params.id
        }
    });
    if (result > 0) {
        msg = "success";
    }
    return res.json(msg)
});


module.exports = router;