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
        order: [
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

            // Para cada evento, se houver uma imagem, converta para base64
            data.forEach(event => {
                if (event.image) {
                    event.imageBase64 = Buffer.from(event.image).toString('base64');
                }
            });
    
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