
const express = require('express');
const router = express.Router();
const sequelize = require('sequelize');
const groupModel = require('../models/groupsModel');
const userGroupsModel = require('../models/userGroupsModel');
const fs = require('fs');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


//CREATE GROUP
router.post('/createGroup', upload.single('image'), (req, res) =>{
    const {
        nameGroup,
        type,
        description,
        rules
    } = req.body;

    if (!req.session.user) {
        res.status(401).send('Usuário não autenticado.');
        return;
    }

    if(req.file){
        const imagemBuffer = req.file.buffer;

        groupModel.create({
            name: nameGroup,
            description: description,
            creatorId: req.session.user.id,
            isPublic: type,
            memberCount: +1,   
            rules: rules,
            image: imagemBuffer
        })
        .then(() =>{
            console.log('Group created with sucess!');
            res.redirect('/homepage');
        })
        .catch((error) => {
            console.error('Error at created group: ', error);
            res.status(500).redirect('/criarGrupos');
        })
    }else{
        groupModel.create({
            name: nameGroup,
            description: description,
            creatorId: req.session.user.id,
            isPublic: type,
            memberCount: +1,   
            rules: rules
        })
        .then(() =>{
            console.log('Group created with sucess! (without image)');
            res.redirect('/homepage');
        })
        .catch((error) => {
            console.error('Error at created group (without image): ', error);
            res.status(500).redirect('/criarGrupos');
        });
    }
});



module.exports = router;