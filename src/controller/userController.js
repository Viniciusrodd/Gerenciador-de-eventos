
const express = require('express');
const router = express.Router();


router.get('/register', (req, res) =>{
    res.render('register')
})


router.post('/saveRecords', (req, res) =>{
    var {nome, email, senha} = req.body;

    res.json({nome, email, senha})
})


module.exports = router;