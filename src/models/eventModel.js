

const {Sequelize, DataTypes} = require('sequelize');
const Conection = require('../database/conection');
const recordModel = require('./recordModel');


const Events = Conection.define('Events', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['Privado', 'Público']], // Validação para aceitar apenas os valores permitidos
        }
    },
    organizador: {
        type: DataTypes.STRING,
        allowNull: false        
    },
    data: {
        type: DataTypes.DATEONLY, // Apenas a data (ano-mês-dia)
        allowNull: false,
    },
    hora_inicio: {
        type: DataTypes.TIME, // Apenas o horário (hora:minuto:segundo)
        allowNull: false,
    },
    hora_fim: {
        type: DataTypes.TIME, // Apenas o horário (hora:minuto:segundo)
        allowNull: false,
    },
    endereco: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descricao: {
        type: DataTypes.STRING(600),
        allowNull: false,
    },
    image: {
        type: DataTypes.BLOB('long'),
        allowNull: true
    },
    userId: {  // Aqui está o campo de chave estrangeira
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: recordModel,  // Referencia ao modelo 'record'
            key: 'id'  // Chave primária da tabela 'records'
        }
    }
})


Events.sync({force: false})
    .then(() =>{
        console.log('Events table sync')
    })
    .catch((error) =>{
        console.log(error)
    })


module.exports = Events;