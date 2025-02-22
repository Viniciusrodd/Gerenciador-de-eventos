const express = require('express');
const router = express.Router();
const eventModel = require('../models/eventModel');
const participationModel = require('../models/participation');
const sequelize = require('sequelize');
const fs = require('fs');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



//EVENTS DISPARTICIPATE
router.post('/events/disparticipate', (req, res) =>{
    const eventIdVar = req.body.eventId;

    participationModel.destroy({
        where: {
            eventId: eventIdVar
        }
    })
    .then(() =>{
        console.log('Participation event removed');
        return res.redirect('/eventosInscritos');
    })
    .catch((error) =>{
        console.log('Participation event FAILED at removed', error);
        return res.redirect('/eventosInscritos');
    });
});


//DELETE EVENTS
router.post('/deleteEvents', (req, res) =>{
    const eventId = req.body.id;

    eventModel.destroy({
        where:{
            id: eventId
        }
    })
    .then(() =>{
        console.log('Event deleted with sucess');
        return res.redirect('/homepage');
    })
    .catch((error) =>{
        console.log('Failed at delete event', error);
        return res.redirect('/editarEvento');
    });
});


//UPLOAD EVENTS
router.put('/uploadEvents/:id', upload.array('image'), async (req, res) => {
    try {
        const eventId = req.params.id;
        const updates = req.body;

        const event = await eventModel.findByPk(eventId);
        if (!event) {
            console.log('evento nao encontrado');
            return res.status(404).send({ message: 'Event not found!' });
        }

        Object.keys(updates).forEach((key) => {
            if (key !== 'id') {
                event[key] = updates[key];
            }
        });

        if (req.files && req.files.length > 0) {
            const uploadedFile = req.files[0];
            event.image = uploadedFile.buffer;        
        }

        await event.save();

        console.log('Event updated successfully');
        return res.redirect('/homepage');
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).send({ message: 'Server error.' });
    }
});


//EVENT PARTICIPATE
router.post('/participate', async (req, res) =>{
    const userIdVar = req.body.userId;
    const eventIdVar = req.body.eventId;

    try{
        const userEvents = await eventModel.findAll({
            where: {
                userId: userIdVar
            }
        });

        const isOwnEvent = userEvents.some(event => event.id === parseInt(eventIdVar));
        if(isOwnEvent){
            console.log('This is your event, so you already participate');
            return res.redirect('/homepage');
        }

        const [participation, created] = await participationModel.findOrCreate({
            where: {
                userId: userIdVar,
                eventId: eventIdVar
            }
        });

        if(created){
            console.log('Participation created sucess');
            return res.redirect('/eventosInscritos?participationCreated=participation');
        }else{
            console.log('Participation already exist');
            return res.redirect('/homepage?participationExist=participation');
        }

    }
    catch(error){
        console.log('Error at create participation', error);
        return res.redirect('/homepage');
    };
});


//CREATE EVENT
router.post('/createEvent', upload.single('imagem'), (req, res) =>{
    const {
        nomeEvento,
        tipo,
        organizador,
        data,
        hora_inicio,
        hora_fim,
        endereco,
        descricao,
        groupId
    } = req.body;

    if (!req.session.user) {
        res.status(401).send('Usuário não autenticado.');
        return;
    }

    if(req.file){
        const imagemBuffer = req.file.buffer;

        eventModel.create({
            nome: nomeEvento,
            tipo: tipo,
            organizador: organizador,
            data: data,
            hora_inicio: hora_inicio,
            hora_fim: hora_fim,
            endereco: endereco,
            descricao: descricao,
            image: imagemBuffer,
            userId: req.session.user.id,
            groupId: groupId
        })
        .then(() => {
            console.log('Event created with success!');
            res.redirect('/homepage');
        })
        .catch((error) => {
            console.error('Error at created event:', error);
            res.status(500).redirect('/criarEventos');
        });
    }else{
        eventModel.create({
            nome: nomeEvento,
            tipo: tipo,
            organizador: organizador,
            data: data,
            hora_inicio: hora_inicio,
            hora_fim: hora_fim,
            endereco: endereco,
            descricao: descricao,
            userId: req.session.user.id,
            groupId: groupId
        })
        .then(() => {
            console.log('Event created with success! (without image)');
            res.redirect('/homepage');
        })
        .catch((error) => {
            console.error('Erro at create event (without image):', error);
            res.status(500).redirect('/criarEventos');
        });
    }
});


module.exports = router;