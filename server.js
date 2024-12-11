
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const conection = require('./src/database/conection');


const recordsModel = require('./src/models/recordsModel');


conection.authenticate()
    .then(() =>{
        console.log('Data base authenticated');
    })
    .catch((error) =>{
        console.log(error)
    })



app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));
app.use(express.static(path.join(__dirname, 'public')));


const userController = require('./src/controller/userController');
app.use('/', userController);


app.listen(7070, () =>{
    console.log('Event manager running')
});