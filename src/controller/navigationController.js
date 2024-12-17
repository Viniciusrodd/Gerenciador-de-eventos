const express = require('express');
const router = express.Router();
const recordModel = require('../models/recordModel');
const eventModel = require('../models/eventModel');
const sequelize = require('sequelize');
const userAuth = require('../middleware/userAuth');
const moment = require('moment-timezone');


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
                attributes: ['fullName', 'userName', 'image']
                //where: {id: req.session.user.id}
            }
        ]
    })
    .then((data) =>{
        if(req.session.user){
            const user = req.session.user;
            //se houver uma imagem -> para base64
            data.forEach(event => {
                if (event.records && event.records.image) {
                    // Convertendo a imagem da tabela records para base64
                    event.records.profileimage = Buffer.from(event.records.image).toString('base64');
                    event.records.profileimage = `data:image/jpeg;base64,${event.records.profileimage}`
                }

                if (event.image ) {
                    event.imageBase64 = Buffer.from(event.image).toString('base64');
                    event.imageEvent = `data:image/jpeg;base64,${event.imageBase64}`
                }

                // Trabalhando com a data
                const eventDate = moment(event.data).tz('America/Sao_Paulo', true);
                event.day = eventDate.date();  // Extrai o dia
                event.month = eventDate.month() + 1;  // Extrai o mês (0-11, por isso adicionamos 1)
                event.year = eventDate.year();  // Extrai o ano
                


                // Trabalhando com o horário
                if (event.hora_inicio) { // Valida se o campo de horário de início existe
                    const startTime = moment(event.hora_inicio, 'HH:mm:ss').tz('America/Sao_Paulo', true);
                    event.startHours = startTime.hours();
                    event.startMinutes = startTime.minutes();
                    event.startSeconds = startTime.seconds();
                }

                if (event.hora_fim) { // Valida se o campo de horário de fim existe
                    const endTime = moment(event.hora_fim, 'HH:mm:ss').tz('America/Sao_Paulo', true);
                    event.endHours = endTime.hours();
                    event.endMinutes = endTime.minutes();
                    event.endSeconds = endTime.seconds();
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