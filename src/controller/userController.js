
const express = require('express');
const router = express.Router();
const recordModel = require('../models/recordModel');
const eventModel = require('../models/eventModel');
const participationModel = require('../models/participation');

const multer = require('multer');
const bcrypt = require('bcrypt');
const sequelize = require('sequelize');


//config do multer
const storage = multer.memoryStorage();  // Isso armazena os arquivos na memória
const upload = multer({ storage: storage });


router.post('/uploadEvents', upload.single('image') ,async (req, res) =>{
    const eventId = req.body.id; // ID enviado pelo input hidden
    const updates = req.body;

    try {
        const event = await eventModel.findByPk(eventId);

        if (event) {
            Object.keys(updates).forEach(key => { //array de nomes das propriedade de obj updates
                if (key !== 'id') {
                    event[key] = updates[key];
                }
            });

            var imagem = req.file

            if (req.file) {
                event.image = imagem.buffer;
            }

            await event.save();

            console.log('Event Updated with sucess')
            res.redirect('/homepage');
        } else {
            res.status(404).send({ message: 'Event not found!' });
        }
    } catch (error) {
        console.error('Error at updated event:', error);
        res.status(500).send({ message: 'Server error.' });
    }
})


router.post('/participate', async (req, res) =>{
    var userIdVar = req.body.userId;
    var eventIdVar = req.body.eventId;

    try{
        var userEvents = await eventModel.findAll({
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
        }else{
            console.log('Participation already exist');
        }

        return res.redirect('/homepage');
    }
    catch(error){
        console.log('Error at create participation', error)
        return res.redirect('/homepage')
    }
})


router.post('/createEvent', upload.single('imagem'), (req, res) =>{
    var {
        nomeEvento, 
        tipo, 
        organizador, 
        data, 
        hora_inicio, 
        hora_fim, 
        endereco, 
        descricao
    } = req.body;

    const imagem = req.file;

    if(req.session.user){
        eventModel.create({
            nome: nomeEvento,
            tipo: tipo,
            organizador: organizador,
            data: data,
            hora_inicio: hora_inicio,
            hora_fim: hora_fim,
            endereco: endereco,
            descricao: descricao,
            image: imagem.buffer,
            userId: req.session.user.id
        })
        .then(() =>{
            console.log('Event created sucess')
            res.redirect('/homepage')
        })
        .catch((error) =>{
            console.log('erro to create event' + error)
            res.redirect('/homepage')
        })    
    }
})



router.post('/saveRecords', upload.single('imageCreate'),async (req, res) =>{
    //console.log(req.file);
    try{
        const {fullname, username, email, password} = req.body;
        var imagem = req.file;

        if (!fullname || !username || !email || !password) {
            return res.redirect('/registro');
        }

        const userExists = await recordModel.findOne({ 
            where: { email: email } 
        });
        if (userExists) {
            return res.redirect('/registro');
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        await recordModel.create({
            fullName: fullname,
            userName: username,
            email: email,
            password: hash,
            image: imagem.buffer
        });

        console.log('Record sucess create')
        res.redirect('/login')
    }
    catch(error){
        console.error(`Error in create record: ${error} image${imagem}`);
        res.status(500).send('Error to process record');
    }
})


router.post('/authenticateLogin', (req, res) =>{
    var emailVar = req.body.email
    var passwordVar = req.body.password

    recordModel.findOne({
        where: {
            email: emailVar,
        }
    })
    .then((dadosLogin) =>{
        if(dadosLogin != undefined){
            var correct = bcrypt.compareSync(passwordVar, dadosLogin.password)
            if(correct){
                req.session.user = {
                    id: dadosLogin.id,
                    email: dadosLogin.email,
                    userName: dadosLogin.userName
                }
                res.redirect('/homepage')
                console.log('Login sucess')
            }else{
                res.redirect('/login')
                console.log('Wrong password')
            }
        }else{
            res.redirect('/login')
            console.log('Wrong login data')
        }
    })


})


module.exports = router;