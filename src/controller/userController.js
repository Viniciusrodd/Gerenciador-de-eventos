
const express = require('express');
const router = express.Router();
const recordModel = require('../models/recordModel');
const eventModel = require('../models/eventModel');
const groupModel = require('../models/groupsModel');
const userGroupsModel = require('../models/userGroupsModel');
const participationModel = require('../models/participation');
const conection = require('../database/conection');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcrypt');
const sequelize = require('sequelize');

//config do multer
const storage = multer.memoryStorage();  // Isso armazena os arquivos na memória
const upload = multer({ storage: storage });


//DELETE ACCOUNT
router.post('/deleteAccount', async (req, res) =>{
    const userIdvar = req.session.user.id;

    try{
        // Inicia uma transação para garantir a atomicidade do processo
        await conection.transaction(async (t) => {
            // Deleta participações do usuário em grupos, se existirem
            await userGroupsModel.destroy({
                where: { userId: userIdvar },
                transaction: t,
            });

            // Deleta os grupos que o usuário criou, se existirem
            await groupModel.destroy({
                where: { creatorId: userIdvar },
                transaction: t,
            });

            // Deleta as participações do usuário em eventos, se existirem
            await participationModel.destroy({
                where: { userId: userIdvar },
                transaction: t,
            });

            // Deleta os eventos criados pelo usuário, se existirem
            await eventModel.destroy({
                where: { userId: userIdvar },
                transaction: t,
            });

            // Finalmente, deleta o registro do usuário
            await recordModel.destroy({
                    where: { id: userIdvar },
                    transaction: t,
                });
        });

        console.log('Perfil deletado com sucesso');
        return res.redirect('/login');
    }
    catch(error){
        console.log('Delete profile process failed', error);
        return res.status(500).send('Delete profile process failed', error);
    };
});


//UPDATE NAMES
router.post('/updateNames', async (req, res) =>{
    const fullNameVar = req.body.fullName;
    const userNameVar = req.body.userName;
    const userId = req.session.user.id;

    try{
        const record = await recordModel.findOne({
            where: {
                id: userId
            }
        });

        if (!record) {
            console.log('Erro: fullName already exist');
            return res.redirect('/editarPerfil');
        }

        await recordModel.update({
            fullName: fullNameVar,
            userName: userNameVar 
        }, {
            where: {id: userId}
        });

        console.log('Atualizado com sucesso');
        res.redirect('/editarPerfil');
    }
    catch(error){
        res.status(400).send('Erro at updated profile names' + error)
    };
});


//UPLOAD USER IMAGE
router.post('/uploadImage', upload.single('image'), (req, res) =>{
    const imageUpdated = req.file;
    const userId = req.session.user.id;

    if(!imageUpdated){
        res.status(400).send('No image file send');
    }

    recordModel.update({
        image: imageUpdated.buffer
    }, {
        where: {id: userId} 
    })
    .then(() =>{
        console.log('Profile image success updated');
        return res.redirect('/editarPerfil');
    })
    .catch((error) =>{
        res.status(400).send('Erro at process image file send' + error);
    });
});


//AUTHENTICATE LOGIN
router.post('/authenticateLogin', async (req, res) =>{
    const emailVar = req.body.email;
    const passwordVar = req.body.password;
    
    try{
        const recordData = await recordModel.findOne({
            where: {
                email: emailVar,
            }
        });

        if(!recordData){
            console.log('Wrong user data');
            return res.redirect('/login?userDataWrong=Dados não existentes');
        }

        if(recordData){
            const correct = bcrypt.compareSync(passwordVar, recordData.password);
            if(correct){
                req.session.user = {
                    id: recordData.id,
                    email: recordData.email,
                    userName: recordData.userName,
                    fullName: recordData.fullName
                };
                console.log('Login sucess');
                return res.redirect('/homepage?sucess=Message for modal');
            }else{
                console.log('Wrong password');
                return res.redirect('/login?wrongPassword=Senha incorreta');
            }
        }
    }
    catch(error){
        console.log('Error at authenticate user', error);
        return res.redirect('/login');
    };
});


//SAVE RECORDS
router.post('/saveRecords', upload.single('imageCreate'),async (req, res) =>{
    try{
        const {fullname, username, email, password} = req.body;

        if (!fullname || !username || !email || !password) {
            console.log('Fields empty');
            return res.redirect('/registro');
        }

        const userEmailExists = await recordModel.findOne({ 
            where: { email: email } 
        });
        if (userEmailExists) {
            console.log('user email already exist');
            return res.redirect(`/registro?emailExist=email ja existe`);
        }
        const userNameExist = await recordModel.findOne({
            where: { userName: username }
        });
        if(userNameExist){
            console.log('userName already exist');
            return res.redirect(`/registro?userName=username ja existe`);
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        if(req.file){
            const image = req.file.buffer;
        
            await recordModel.create({
                fullName: fullname,
                userName: username,
                email: email,
                password: hash,
                image: image
            });
    
            console.log('Record sucess create');
            res.redirect('/login?success=Usuário registrado com sucesso');
        }else{
            await recordModel.create({
                fullName: fullname,
                userName: username,
                email: email,
                password: hash,
            });

            console.log('Record sucess create (without image)');
            res.redirect('/login?success=Usuário registrado com sucesso');        
        }
    }
    catch(error){
        console.error(`Error in create record: ${error}`);
        res.redirect('/registro');
    };
});


module.exports = router;