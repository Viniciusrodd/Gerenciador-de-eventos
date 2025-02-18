const express = require('express');
const router = express.Router();
const recordModel = require('../models/recordModel');
const eventModel = require('../models/eventModel');
const participationModel = require('../models/participation');
const sequelize = require('sequelize');
const userAuth = require('../middleware/userAuth');
const moment = require('moment-timezone');
const { Op } = require('sequelize'); // Operadores do Sequelize


async function deleteEventsByData(){
    try{
        const date = new Date();
        const currentDate = date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
        const currentTime = date.toTimeString().split(' ')[0]; // 'HH:mm:ss'
        const nextYear = parseInt(date.toISOString().split('-')[0]) + 1;

        const eventsRemoved = await eventModel.destroy({
            where: {
                [Op.or]: [
                    {
                        // Condição: Data é menor que a data atual
                        data: {
                            [Op.lt]: currentDate,
                        },
                    },
                    {
                        // Condição: Data é igual à data atual e hora_fim é menor que a hora atual
                        [Op.and]: [
                            { data: currentDate },
                            { hora_fim: { [Op.lt]: currentTime } },
                        ],
                    },
                    sequelize.where(
                        sequelize.fn('YEAR', sequelize.col('data')),
                        {
                            [Op.gt]: nextYear,
                        }
                    ),
                ],
            },
        });
        //Op.and e Op.or: Combina condições lógicas
        //Op.lt (less than): Verifica se o valor é menor.
        //.gt (greater than)
        console.log(`${eventsRemoved} evento(s) excluído(s).`);
    }
    catch(error){
        console.error('Error at remove expired events:', error);
    }
}


router.get('/registro', (req, res) =>{
    res.render('../views/user.ejs/register');
})


router.get('/login', (req, res) =>{
    res.render('../views/user.ejs/login');
})


router.get('/homepage', userAuth, async (req, res) =>{
    try{
        await deleteEventsByData()
            
        var eventData = await eventModel.findAll({
            order: [
                ['id', 'DESC']
            ]
        })
        var profileData = await recordModel.findAll()
        var userIdSession = req.session.user.id;

        profileData.forEach(data =>{
            if (data && data.image) {
                // Convertendo a imagem da tabela records para base64
                data.profileimage = Buffer.from(data.image).toString('base64');
                data.profileimage = `data:image/jpeg;base64,${data.profileimage}`
            }
        })

        eventData.forEach(event => {
            if (event.image ) {
                event.imageBase64 = Buffer.from(event.image).toString('base64');
                event.imageEvent = `data:image/jpeg;base64,${event.imageBase64}`
            }

            // Trabalhando com a data
            const eventDate = moment(event.data).tz('America/Sao_Paulo', true);
            event.day = eventDate.date();  // Extrai o dia
            event.month = eventDate.month() + 1;  // Extrai o mês (0-11, por isso adicionamos 1)
            event.year = eventDate.year();  // Extrai o ano
        
            // Trabalhando com o horário
            if (event.hora_inicio) { // Valida se o campo de horário de início existe
                const startTime = moment(event.hora_inicio, 'HH:mm:ss').tz('America/Sao_Paulo', true);
                event.startHours = startTime.hours();
                event.startMinutes = startTime.minutes();
                event.startSeconds = startTime.seconds();
            }

            if (event.hora_fim) { // Valida se o campo de horário de fim existe
                const endTime = moment(event.hora_fim, 'HH:mm:ss').tz('America/Sao_Paulo', true);
                event.endHours = endTime.hours();
                event.endMinutes = endTime.minutes();
                event.endSeconds = endTime.seconds();
            }
        });

        res.render('homepage', {
            dadosEvents: eventData,
            dadosProfile: profileData,
            userId: userIdSession
        });    
    }
    catch(error){
        console.log('Error at homepage', error)
        return res.redirect('/login')
    }         
})


router.get('/criarEventos', userAuth,(req, res) =>{
    if(req.session.user){
        const user = req.session.user;

        res.render('../views/events.ejs/criar-eventos', {
            userData: user
        });
    }else{
        res.redirect('/login')
    }
})



router.get('/eventosInscritos', userAuth, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const participationData = await participationModel.findAll({
            attributes: ['eventId'],
            where: { userId: userId } 
        });

        const eventIdsForUser = participationData.map(participation => participation.dataValues.eventId);
        console.log('Event IDs for User:', eventIdsForUser)

        if (eventIdsForUser.length === 0) {
            return res.render('../views/events.ejs/eventos-inscritos', {
                dadosEvents: eventIdsForUser
            });
        }
        
        const events = await eventModel.findAll({
            where: {
                id: eventIdsForUser, // Filtrar apenas pelos IDs encontrados
            },
            include: [
                {
                    model: recordModel,
                    as: 'records', // Alias usado na associação
                    attributes: ['fullName', 'userName', 'image'],
                }
            ],
        });

        if (events && events.length > 0) {
            // Trabalhando com os eventos
            events.forEach(event => {
                if (event.records && event.records.image) {
                    // Convertendo a imagem da tabela records para base64
                    event.records.profileimage = Buffer.from(event.records.image).toString('base64');
                    event.records.profileimage = `data:image/jpeg;base64,${event.records.profileimage}`;
                }

                if (event.image) {
                    event.imageBase64 = Buffer.from(event.image).toString('base64');
                    event.imageEvent = `data:image/jpeg;base64,${event.imageBase64}`;
                }

                // Trabalhando com a data
                const eventDate = moment(event.data).tz('America/Sao_Paulo', true);
                event.day = eventDate.date();
                event.month = eventDate.month() + 1;
                event.year = eventDate.year();

                // Trabalhando com o horário
                if (event.hora_inicio) {
                    const startTime = moment(event.hora_inicio, 'HH:mm:ss').tz('America/Sao_Paulo', true);
                    event.startHours = startTime.hours();
                    event.startMinutes = startTime.minutes();
                    event.startSeconds = startTime.seconds();
                }

                if (event.hora_fim) {
                    const endTime = moment(event.hora_fim, 'HH:mm:ss').tz('America/Sao_Paulo', true);
                    event.endHours = endTime.hours();
                    event.endMinutes = endTime.minutes();
                    event.endSeconds = endTime.seconds();
                }
            });
           
            res.render('../views/events.ejs/eventos-inscritos', {
                dadosEvents: events,
                userData: req.session.user
            });
        } else {
            res.redirect('/homepage'); // Caso não haja eventos para exibir
            console.log('nao tem eventos' + events)
        }
    } catch (error) {
        console.log('Error at rendering "eventos-inscritos"', error);
        res.redirect('/homepage');
    }
});


router.get('/logout', (req, res) =>{
    req.session.id = undefined
    console.log('User LogOut sucess')
    return res.redirect('/login')
})


router.post('/editarEvento', userAuth, async (req, res) =>{
    var eventId = req.body.eventId

    try{
        var eventsData = await eventModel.findAll({
            where: {
                id: eventId
            }
        })

        const result = await eventsData.map(event => ({
            id: event.dataValues.id,
            nome: event.dataValues.nome,
            tipo: event.dataValues.tipo,
            organizador: event.dataValues.organizador,
            data: event.dataValues.data,
            hora_inicio: event.dataValues.hora_inicio,
            hora_fim: event.dataValues.hora_fim,
            endereco: event.dataValues.endereco,
            descricao: event.dataValues.descricao,
            image: event.dataValues.image, //imagem em formato de Buffer
        }));


        return res.render('../views/events.ejs/editar-eventos', {
            eventsData: result
        })
    }
    catch(error){
        console.log('Error at editEvent route' + error)
        return redirect('/homepage')
    }
})


router.get('/editarPerfil', userAuth ,async (req, res) =>{

    const idVar = await req.session.user.id

    if(!idVar){
        return res.status(400).send('User id to edit profile not found')
    }

    var recordData = await recordModel.findAll({
        where: {
            id: idVar     
        }
    })

    var result = await recordData.map(events => ({
        id: events.dataValues.id,
        fullName: events.dataValues.fullName,
        userName: events.dataValues.userName,
        email: events.dataValues.email,
        password: events.dataValues.password,
        image: events.dataValues.image
    }))

    res.render('../views/user.ejs/editar-perfil', {
        recordData: result
    })
})


router.get('/meusEventos', async (req, res) =>{
    try{
        var userIdVar = await req.session.user.id

        const events = await eventModel.findAll({
            where: {
                userId: userIdVar 
            }
        })

        if(events){
            events.forEach(event =>{
                if (event.image) {
                    event.imageBase64 = Buffer.from(event.image).toString('base64');
                    event.imageEvent = `data:image/jpeg;base64,${event.imageBase64}`;
                }

                // Trabalhando com a data
                const eventDate = moment(event.data).tz('America/Sao_Paulo', true);
                event.day = eventDate.date();
                event.month = eventDate.month() + 1;
                event.year = eventDate.year();

                // Trabalhando com o horário
                if (event.hora_inicio) {
                    const startTime = moment(event.hora_inicio, 'HH:mm:ss').tz('America/Sao_Paulo', true);
                    event.startHours = startTime.hours();
                    event.startMinutes = startTime.minutes();
                    event.startSeconds = startTime.seconds();
                }

                if (event.hora_fim) {
                    const endTime = moment(event.hora_fim, 'HH:mm:ss').tz('America/Sao_Paulo', true);
                    event.endHours = endTime.hours();
                    event.endMinutes = endTime.minutes();
                    event.endSeconds = endTime.seconds();
                }
            })
            res.render('../views/events.ejs/meus-eventos', {
                myEvents: events
            })
        }
    }
    catch(error){
        console.log('Error at show your own events', error)
        return res.redirect('/homepage')
    }

});


//GROUPS


router.get('/criarGrupos', (req, res) => {
    res.render('../views/groups.ejs/criar-grupo')
});


module.exports = router;