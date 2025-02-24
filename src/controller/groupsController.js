
const express = require('express');
const router = express.Router();
const sequelize = require('sequelize');
const groupModel = require('../models/groupsModel');
const userGroupsModel = require('../models/userGroupsModel');
const recordModel = require('../models/recordModel');
const fs = require('fs');
const { Op } = require('sequelize');

const multer = require('multer');
const userAuth = require('../middleware/userAuth');
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

        return res.redirect('/meusGrupos');
    }
    catch(error){
        console.log('Internal server error at create a group', error);
        return res.status(500).redirect('/criarGrupos');
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

        const [participation, created] = await userGroupsModel.findOrCreate({
            where: {
                userId: userid,
                groupId: groupid                            
            }
        });

        if(created){
            console.log('Group participation created');
            return res.redirect('/gruposInscritos?participationCreated=participation');
        }else{
            console.log('Participation already exist');
            return res.redirect('/gruposInscritos?participationExist=participation');
        }
    }
    catch(error){
        console.log('Internal server error at Group participation', error);
        return res.status(500).send('Internal server error at Group participation', error);
    };
}); 


router.post('/groups/disparticipate', userAuth, (req, res) => {
    const groupIdVar = req.body.groupid;
    const userIdVar = req.session.user.id;

    userGroupsModel.destroy({
        where: {
            [Op.and]: [
                { groupId: groupIdVar },
                { userId: userIdVar }
            ]
        }
    })
    .then(() => {
        console.log('Participation group removed');
        return res.redirect('/gruposInscritos');
    })
    .catch((error) => {
        console.log('Internal error at Remove participation of a group', error);
        return res.status(500).send('Internal error at Remove participation of a group', error);
    });
});


//UPLOAD GRUPS
router.put('/uploadGroups/:id', upload.array('image'), async (req, res) => {
    const groupId = req.params.id;
    const updates = req.body;

    try{
        const groups = await groupModel.findByPk(groupId);
        if(!groups){
            console.log('Group not found');
            return res.status(404).send('Group not found!');
        }

        Object.keys(updates).forEach((key) => {
            if(key !== 'id'){
                groups[key] = updates[key];
            }
        });

        if (req.files && req.files.length > 0) {
            const uploadedFile = req.files[0];
            groups.image = uploadedFile.buffer;        
        }

        await groups.save();

        console.log('Group updated successfully');
        return res.redirect('/meusGrupos');
    }
    catch(error){
        console.log('Internal server error at upload groups', error);
        return res.status(500).send('Internal server error at upload groups', error);
    };
});


//DELETE GROUPS
router.post('/deleteGroups', async (req, res) => {
    const groupId = req.body.deleteid;

    try{
        const userGroupData = await userGroupsModel.destroy({
            where: { groupId: groupId }
        });

        const groupData = await groupModel.destroy({
            where: { id: groupId }
        });

        if(!userGroupData){
            console.log('Error at delete User Group Data');
            return res.status(500).send('Error at delete User Group Data');
        }
        if(!groupData){
            console.log('Error at delete Group Data');
            return res.status(500).send('Error at delete Group Data');
        }

        console.log('Group deleted with sucess');
        return res.redirect('/meusGrupos');    
    }
    catch(error){
        console.log('Internal server error at delete group', error);
        return res.status(500).send('Internal server error at delete group', error);
    }
});


module.exports = router;