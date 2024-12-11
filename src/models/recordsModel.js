

const {Sequelize, DataTypes} = require('sequelize');
const Conection = require('../database/conection');
const { FORCE } = require('sequelize/lib/index-hints');

const Record = Conection.define('Record',{
    fullname: {
        type: DataTypes.STRING,
        allownull: false
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


Record.sync({FORCE: false})
    .then(() =>{
        console.log('Record table sync')
    })
    .catch((error) =>{
        console.log(error)
    });

module.exports = Record;