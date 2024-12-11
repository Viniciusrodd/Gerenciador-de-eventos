
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const router = require('./src/routes/routes');
const path = require('path');


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', router);


app.listen(7070, () =>{
    console.log('Event manager running')
});