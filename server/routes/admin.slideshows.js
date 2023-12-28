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
    let marginTop = req.body.marginTop ? req.body.marginTop : 0;
    let marginRight = req.body.marginRight ? req.body.marginRight : 0;
    let marginBottom = req.body.marginBottom ? req.body.marginBottom : 0;
    let marginLeft = req.body.marginLeft ? req.body.marginLeft : 0;
    let backgroundColor = req.body.backgroundColor ? req.body.backgroundColor : "#FFFFFF";

    // Create the slideshow
    const slideshow = await Slideshow.create({
        name: name,
        marginTop: marginTop,
        marginRight: marginRight,
        marginBottom: marginBottom,
        marginLeft: marginLeft,
        backgroundColor: backgroundColor,
    });

    // save the slides
    let slides = req.body.slides;
    if (slides) {
        slides.forEach(async function (slide, index) {
            await Slide.create({
                url: slide.url,
                duration: slide.duration,
                slideshowId: slideshow.id,
                position: index
            })
        });
    }

    return res.redirect('/admin/slideshows/')
});

/**
 * Update
 */
router.get('/edit/:id', async function (req, res) {
    const slideshow = await Slideshow.findByPk(req.params.id, {
        include: [Slide],
        order: [[Slide, 'position', 'asc']]
    });
    if (slideshow !== null) {
        return res.render('admin/slideshows/edit', { entry: slideshow });
    }
    return res.redirect('/admin/slideshows/')
});
router.post('/edit/:id', async function (req, res) {

    let slideshowID = req.params.id;

    // save the slideshow
    let name = req.body.name;
    let marginTop = req.body.marginTop ? req.body.marginTop : 0;
    let marginRight = req.body.marginRight ? req.body.marginRight : 0;
    let marginBottom = req.body.marginBottom ? req.body.marginBottom : 0;
    let marginLeft = req.body.marginLeft ? req.body.marginLeft : 0;
    let backgroundColor = req.body.backgroundColor ? req.body.backgroundColor : "#FFFFFF";

    const slideshow = await Slideshow.findByPk(slideshowID);
    if (slideshow !== null) {
        await slideshow.update({
            name: name,
            marginTop: marginTop,
            marginRight: marginRight,
            marginBottom: marginBottom,
            marginLeft: marginLeft,
            backgroundColor: backgroundColor,
            lastChange: new Date()
        })
    }

    // save the slides
    let slides = req.body.slides;
    if (slides) {
        slides.forEach(async function (slide, index) {

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
                        duration: slide.duration,
                        position: index
                    })
                    createNew = false;
                }
            }

            if (createNew) {
                await Slide.create({
                    url: slide.url,
                    duration: slide.duration,
                    slideshowId: slideshowID,
                    position: index
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