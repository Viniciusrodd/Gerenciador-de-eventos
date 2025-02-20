
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
router.post('/createGroup', upload.single('image'), async (req, res) =>{
    const { nameGroup, type, description, rules } = req.body;

    if (!req.session.user) {
        res.status(401).send('Usuário não autenticado.');
        return;
    }

    try{
        let newGroup;

        if(req.file){
            const imagemBuffer = req.file.buffer;
    
            newGroup = await groupModel.create({
                name: nameGroup,
                description: description,
                creatorId: req.session.user.id,
                isPublic: type,
                memberCount: +1,   
                rules: rules,
                image: imagemBuffer
            });
        }else{
            newGroup = await groupModel.create({
                name: nameGroup,
                description: description,
                creatorId: req.session.user.id,
                isPublic: type,
                memberCount: +1,   
                rules: rules
            });
        }

        console.log('Group created successfully!');

        await userGroupsModel.create({
            userId: req.session.user.id,
            groupId: newGroup.id
        });

        res.redirect('/gruposPesquisa');
    }
    catch(error){
        console.log('Internal server error at create a group', error);
        res.status(500).redirect('/criarGrupos');
    }
});



module.exports = router;