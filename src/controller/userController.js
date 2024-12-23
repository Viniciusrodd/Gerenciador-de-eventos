
const express = require('express');
const router = express.Router();
const recordModel = require('../models/recordModel');
const eventModel = require('../models/eventModel');
const participationModel = require('../models/participation');
const fs = require('fs');

const multer = require('multer');
const bcrypt = require('bcrypt');
const sequelize = require('sequelize');


//config do multer
const storage = multer.memoryStorage();  // Isso armazena os arquivos na memória
const upload = multer({ storage: storage });


router.post('/deleteEvents', (req, res) =>{
    var eventId = req.body.id;

    eventModel.destroy({
        where:{
            id: eventId
        }
    })
    .then(() =>{
        console.log('Event deleted with sucess')
        return res.redirect('/homepage')
    })
    .catch((error) =>{
        console.log('Failed at delete event', error)
        return res.redirect('/editarEvento')
    })
})


router.post('/deleteAccount', async (req, res) =>{
    var userIdvar = req.session.user.id;

    try{
        await recordModel.destroy({
            where: {
                id: userIdvar
            }
        })

        await eventModel.destroy({
            where: {
                userId: userIdvar
            }
        })

        console.log('Profile deleted with success');
        return res.redirect('/login');
    }
    catch(error){
        res.status(500).send('Delete profile process failed')
    }
})


router.post('/updateNames', async (req, res) =>{
    var fullNameVar = req.body.fullName;
    var userNameVar = req.body.userName;
    var userId = req.session.user.id;

    try{
        const record = await recordModel.findOne({
            where: {
                id: userId
            }
        });

        if (!record) {
            console.log('Erro: fullName already exist')
            return res.redirect('/editarPerfil');
        }

        await recordModel.update({
            fullName: fullNameVar,
            userName: userNameVar 
        }, {
            where: {id: userId}
        })

        console.log('Atualizado com sucesso')
        res.redirect('/editarPerfil');
    }
    catch(error){
        res.status(400).send('Erro at updated profile names' + error)
    }
})


router.post('/uploadImage', upload.single('image'), (req, res) =>{
    var imageUpdated = req.file
    var userId = req.session.user.id

    if(!imageUpdated){
        res.status(400).send('No image file send')
    }

    recordModel.update({
        image: imageUpdated.buffer
    }, {
        where: {id: userId} 
    })
    .then(() =>{
        console.log('Profile image success updated')
        return res.redirect('/editarPerfil')
    })
    .catch((error) =>{
        res.status(400).send('Erro at process image file send' + error)
    })

})


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

        return res.redirect('/eventosInscritos');
    }
    catch(error){
        console.log('Error at create participation', error)
        return res.redirect('/homepage')
    }
})


router.post('/createEvent', upload.single('imagem'), (req, res) =>{
    const {
        nomeEvento,
        tipo,
        organizador,
        data,
        hora_inicio,
        hora_fim,
        endereco,
        descricao
    } = req.body;

    if (!req.session.user) {
        res.status(401).send('Usuário não autenticado.');
        return;
    }

    if(req.file){
        var imagemBuffer = req.file.buffer;

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
            userId: req.session.user.id
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
            userId: req.session.user.id
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
})


router.post('/authenticateLogin', async (req, res) =>{
    var emailVar = req.body.email
    var passwordVar = req.body.password
    
    try{
        var recordData = await recordModel.findOne({
            where: {
                email: emailVar,
            }
        })

        if(!recordData){
            console.log('Wrong user data')
            return res.redirect('/login?userDataWrong=Dados não existentes')
        }

        if(recordData){
            var correct = bcrypt.compareSync(passwordVar, recordData.password)
            if(correct){
                req.session.user = {
                    id: recordData.id,
                    email: recordData.email,
                    userName: recordData.userName
                }
                console.log('Login sucess')
                return res.redirect('/homepage?sucess=Message for modal')
            }else{
                console.log('Wrong password')
                return res.redirect('/login?wrongPassword=Senha incorreta')
            }
        }
    }
    catch(error){
        console.log('Error at authenticate user', error)
        return res.redirect('/login')
    }
})


router.post('/saveRecords', upload.single('imageCreate'),async (req, res) =>{
    try{
        const {fullname, username, email, password} = req.body;

        if (!fullname || !username || !email || !password) {
            console.log('Fields empty')
            return res.redirect('/registro');
        }

        const userExists = await recordModel.findOne({ 
            where: { email: email } 
        });
        if (userExists) {
            console.log('user email already exist')
            return res.redirect(`/registro?emailExist=email ja existe`);
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        if(req.file){
            var image = req.file.buffer;
        
            await recordModel.create({
                fullName: fullname,
                userName: username,
                email: email,
                password: hash,
                image: image
            });
    
            console.log('Record sucess create')
            res.redirect('/login?success=Usuário registrado com sucesso')
        }else{
            await recordModel.create({
                fullName: fullname,
                userName: username,
                email: email,
                password: hash,
            });

            console.log('Record sucess create (without image)')
            res.redirect('/login?success=Usuário registrado com sucesso')        
        }
    }
    catch(error){
        console.error(`Error in create record: ${error}`);
        res.redirect('/registro');
    }
})


module.exports = router;