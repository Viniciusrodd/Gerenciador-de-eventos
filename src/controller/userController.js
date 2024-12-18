
const express = require('express');
const router = express.Router();
const recordModel = require('../models/recordModel');
const eventModel = require('../models/eventModel');

const multer = require('multer');
const bcrypt = require('bcrypt');
const sequelize = require('sequelize');


//config do multer
const storage = multer.memoryStorage();  // Isso armazena os arquivos na memória
const upload = multer({ storage: storage });

/*
router.post('/participate', async (req, res) =>{
    var eventIdVar = req.body.eventId;
    var userIdVar = req.body.userId;

    
})*/


router.post('/upload', upload.single('imagem'), (req, res) =>{
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