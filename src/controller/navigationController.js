const express = require('express');
const router = express.Router();
const recordModel = require('../models/recordModel');
const sequelize = require('sequelize');
const userAuth = require('../middleware/userAuth');


router.get('/registro', (req, res) =>{
    res.render('register')
})


router.get('/login', (req, res) =>{
    res.render('login')
})


module.exports = router;