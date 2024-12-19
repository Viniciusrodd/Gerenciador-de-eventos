const express = require('express');
const router = express.Router();
const recordModel = require('../models/recordModel');
const eventModel = require('../models/eventModel');
const participationModel = require('../models/participation');
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

        res.render('../views/shortHands.ejs/criar-eventos', {
            userData: user
        });
    }else{
        res.redirect('/login')
    }
})



router.get('/eventosInscritos', userAuth, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const participationData = await participationModel.findAll({
            attributes: ['eventId'],
            where: { userId: userId } 
        });

        const eventIdsForUser = participationData.map(participation => participation.dataValues.eventId);
        console.log('Event IDs for User:', eventIdsForUser)

        if (eventIdsForUser.length === 0) {
            return res.send('No events found for this user.');
        }
        
        const events = await eventModel.findAll({
            where: {
                id: eventIdsForUser, // Filtrar apenas pelos IDs encontrados
            },
            include: [
                {
                    model: recordModel,
                    as: 'records', // Alias usado na associação
                    attributes: ['fullName', 'userName', 'image'],
                },
            ],
        });

        if (!events || events.length === 0) {
            return res.send('No events found for these IDs.');
        }

        if (events && events.length > 0) {
            // Trabalhando com os eventos
            events.forEach(event => {
                if (event.records && event.records.image) {
                    // Convertendo a imagem da tabela records para base64
                    event.records.profileimage = Buffer.from(event.records.image).toString('base64');
                    event.records.profileimage = `data:image/jpeg;base64,${event.records.profileimage}`;
                }

                if (event.image) {
                    event.imageBase64 = Buffer.from(event.image).toString('base64');
                    event.imageEvent = `data:image/jpeg;base64,${event.imageBase64}`;
                }

                // Trabalhando com a data
                const eventDate = moment(event.data).tz('America/Sao_Paulo', true);
                event.day = eventDate.date();
                event.month = eventDate.month() + 1;
                event.year = eventDate.year();

                // Trabalhando com o horário
                if (event.hora_inicio) {
                    const startTime = moment(event.hora_inicio, 'HH:mm:ss').tz('America/Sao_Paulo', true);
                    event.startHours = startTime.hours();
                    event.startMinutes = startTime.minutes();
                    event.startSeconds = startTime.seconds();
                }

                if (event.hora_fim) {
                    const endTime = moment(event.hora_fim, 'HH:mm:ss').tz('America/Sao_Paulo', true);
                    event.endHours = endTime.hours();
                    event.endMinutes = endTime.minutes();
                    event.endSeconds = endTime.seconds();
                }
            });
           
            res.render('../views/shortHands.ejs/eventos-inscritos', {
                dadosEvents: events,
                userData: req.session.user
            });
            console.log('eventos' + events)
        } else {
            res.redirect('/homepage'); // Caso não haja eventos para exibir
            console.log('nao tem eventos' + events)
        }
    } catch (error) {
        console.log('Error at rendering "eventos-inscritos"', error);
        res.redirect('/homepage');
    }
});


router.get('/logout', (req, res) =>{
    req.session.id = undefined
    console.log('User LogOut sucess')
    return res.redirect('/login')
})

router.post('/editarEvento', userAuth,(req, res) =>{
    var {userId, eventId} = req.body

    console.log({userId, eventId})
    return res.render('../views/shortHands.ejs/editar-eventos')
})


module.exports = router;