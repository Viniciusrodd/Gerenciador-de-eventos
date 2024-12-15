
const express = require('express');
const router = express.Router();
const recordModel = require('../models/recordModel');
const multer = require('multer');
const bcrypt = require('bcrypt');
const sequelize = require('sequelize');


//config do multer
const storage = multer.memoryStorage();  // Isso armazena os arquivos na memória
const upload = multer({ storage: storage });



router.post('/upload', (req, res) =>{
    
})



router.post('/saveRecords', async (req, res) =>{
    //console.log(req.file);
    try{
        const {fullname, username, email, password} = req.body;

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