
const sequelize = require('sequelize');

const conection = new sequelize(
    'gerenciador-eventos',
    'root',
    'bravogamessempre123', {
        host: 'localhost',
        dialect: 'mysql',
        timezone: '-03:00'
    }
);


module.exports = conection;