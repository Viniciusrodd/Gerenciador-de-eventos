const express = require('express');
const router = express.Router();
const recordModel = require('../models/recordModel');
const eventModel = require('../models/eventModel');
const sequelize = require('sequelize');
const userAuth = require('../middleware/userAuth');


router.get('/registro', (req, res) =>{
    res.render('register');
})


router.get('/login', (req, res) =>{
    res.render('login');
})


router.get('/homepage', userAuth, (req, res) =>{
    eventModel.findAll({
        ordere: [
            ['id', 'DESC']
        ],
        include: [
            {
                model: recordModel,
                attributes: ['fullName', 'userName', 'email']
            }
        ]
    })
    .then((data) =>{
        if(req.session.user){
            const user = req.session.user;
    
            res.render('homepage', {
                dadosEvents: data,
                userData: user
            });
        }else{
            res.redirect('/login')
        }
    })
})

router.get('/criarEventos', userAuth,(req, res) =>{
    if(req.session.user){
        const user = req.session.user;

        res.render('criar-eventos', {
            userData: user
        });
    }else{
        res.redirect('/login')
    }
})


module.exports = router;