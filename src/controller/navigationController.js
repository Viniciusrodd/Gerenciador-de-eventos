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
                as: 'records', // Alias usado na associação
                attributes: ['fullName', 'userName', 'email']
            }
        ]
    })
    .then((data) =>{
        if(req.session.user){
            const user = req.session.user;

            // Para cada evento, se houver uma imagem, converta para base64
            data.forEach(event => {
                if (event.image ) {
                    event.imageBase64 = Buffer.from(event.image).toString('base64');
                }

                // Trabalhando com a data
                const date = new Date(event.data);
                event.day = date.getDate() ;       // Extrai o dia
                event.month = date.getMonth() + 1; // Extrai o mês (0-11, por isso adicionamos 1)
                event.year = date.getFullYear(); // Extrai o ano


                // Trabalhando com o horário
                if (event.hora_inicio) { // Valida se o campo de horário de início existe
                    const [startHours, startMinutes, startSeconds] = event.hora_inicio.split(':');
                    event.startHours = startHours;
                    event.startMinutes = startMinutes;
                    event.startSeconds = startSeconds;
                }

                if (event.hora_fim) { // Valida se o campo de horário de fim existe
                    const [endHours, endMinutes, endSeconds] = event.hora_fim.split(':');
                    event.endHours = endHours;
                    event.endMinutes = endMinutes;
                    event.endSeconds = endSeconds;
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