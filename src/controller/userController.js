
const express = require('express');
const router = express.Router();
const recordModel = require('../models/recordModel');
const multer = require('multer');
const bcrypt = require('bcrypt');
const sequelize = require('sequelize');


//config do multer
/*const storage = multer.memoryStorage(); // Armazena a imagem na memória
const image = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        console.log(file.mimetype);
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Tipo de arquivo não permitido. Envie apenas imagens jpeg, png ou gif.'));
        }
        cb(null, true);
    }
 });*/



router.post('/saveRecords', async (req, res) =>{
    //console.log(req.file);
    try{
        const {fullname, username, email, password} = req.body;

        if (!fullname || !username || !email || !password) {
            return res.redirect('/registro');
        }

        const userExists = await recordModel.findOne({ where: { email: email } });
        if (userExists) {
            return res.redirect('/registro');
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        await recordModel.create({
            fullName: fullname,
            userName: username,
            email: email,
            password: hash
        });

        console.log('Record sucess create')
        res.status(200).send('Record sucess create')
    }
    catch(error){
        console.error(`Error in create record: ${error}`);
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


})


module.exports = router;