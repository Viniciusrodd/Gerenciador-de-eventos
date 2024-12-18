
const {Sequelize, DataTypes} = require('sequelize');
const Conection = require('../database/conection');


const Participation = Conection.define('Participations', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
})


Participation.sync()
    .then(() =>{
        console.log('Participation table sync')
    })
    .catch((error) =>{
        console.log('Error at sync participation table', error)
    })