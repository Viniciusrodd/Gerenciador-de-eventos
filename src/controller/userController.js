
const express = require('express');
const router = express.Router();
const recordsModel = require('../models/recordsModel');
const multer = require('multer');


//config do multer
const storage = multer.memoryStorage(); // Armazena a imagem na memória
const image = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Tipo de arquivo não permitido. Envie apenas imagens jpeg, png ou gif.'));
        }
        cb(null, true);
    }
 });



router.get('/register', (req, res) =>{
    res.render('register')
})



router.post('/saveRecords', image.single('imageFile') , async (req, res) =>{
    try{

    }
    catch(error){
        console.error(`Erro ao criar registro: ${error}`);
        res.status(500).send('Erro ao processar o registro');
    }
    
    var {nome, email, senha} = req.body;

    res.json({nome, email, senha})
})


module.exports = router;