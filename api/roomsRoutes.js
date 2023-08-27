const express = require('express');
const router = express.Router();

router.get('/broadcast', (req, res) => {
    res.redirect(`/${uuidV4()}`);
}); 

router.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});
