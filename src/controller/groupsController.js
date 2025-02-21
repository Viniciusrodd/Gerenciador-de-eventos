
const express = require('express');
const router = express.Router();
const sequelize = require('sequelize');
const groupModel = require('../models/groupsModel');
const userGroupsModel = require('../models/userGroupsModel');
const recordModel = require('../models/recordModel');
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


//GROUP PARTICIPATION
router.post('/groupParticipation', async (req, res) =>{
    const { userid, groupid } = req.body;

    if(!userid || !groupid){
        return res.status(400).send('Bad request');
    }

    try{
        const userExist = await recordModel.findByPk(userid);
        if(!userExist){
            return res.status(404).send('User not found');
        }

        const groupExist = await groupModel.findByPk(groupid);
        if(!groupExist){
            return res.status(404).send('Group not found');
        }

        await userGroupsModel.create({
            userId: userid,
            groupId: groupid
        })
        .then(() =>{
            res.redirect('/gruposInscritos');
        })
        .catch((error) =>{
            res.status(500).send('Error at create Group participation', error);
        })
    }
    catch(error){
        console.log('Internal server error at Group participation', error);
        return res.status(500).send('Internal server error at Group participation', error);
    };
}); 


module.exports = router;