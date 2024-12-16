

const {Sequelize, DataTypes} = require('sequelize');
const Conection = require('../database/conection');

const Record = Conection.define('Record',{
    fullName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING, 
        allowNull: false 
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.BLOB('long'),
        allowNull: true
    }
})


Record.sync({force: false})
    .then(() =>{
        console.log('Record table sync')
    })
    .catch((error) =>{
        console.log(error)
    });

module.exports = Record;