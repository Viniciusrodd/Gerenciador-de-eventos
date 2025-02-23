const express = require('express');
const router = express.Router();
const recordModel = require('../models/recordModel');
const eventModel = require('../models/eventModel');
const participationModel = require('../models/participation');
const groupsModel = require('../models/groupsModel');
const userGroupsModel = require('../models/userGroupsModel');
const sequelize = require('sequelize');
const userAuth = require('../middleware/userAuth');
const moment = require('moment-timezone');
const { Op } = require('sequelize'); // Operadores do Sequelize


//DELETE EVENTS BY DATA
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
};


//REGISTER VIEW
router.get('/registro', (req, res) =>{
    res.render('../views/user.ejs/register');
});


//LOGIN VIEW
router.get('/login', (req, res) =>{
    res.render('../views/user.ejs/login');
});


//HOMEPAGE VIEW
router.get('/homepage', userAuth, async (req, res) =>{
    try{
        await deleteEventsByData();
            
        const eventData = await eventModel.findAll({
            order: [
                ['id', 'DESC']
            ],            
            where:{
                [Op.or]: [
                    { groupId: 0 },
                    { groupId: null }
                ]
            }
        })
        const profileData = await recordModel.findAll();
        const userIdSession = req.session.user.id;

        profileData.forEach(data =>{
            if (data && data.image) {
                // Convertendo a imagem da tabela records para base64
                data.profileimage = Buffer.from(data.image).toString('base64');
                data.profileimage = `data:image/jpeg;base64,${data.profileimage}`;
            }
        });

        eventData.forEach(event => {
            if (event.image ) {
                event.imageBase64 = Buffer.from(event.image).toString('base64');
                event.imageEvent = `data:image/jpeg;base64,${event.imageBase64}`;
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
        console.log('Error at homepage', error);
        return res.redirect('/login');
    };         
});


//EVENTS CREATE VIEW
router.get('/criarEventos/:groupId', userAuth,(req, res) =>{        
    const user = req.session.user;
    const groupIdVar = req.params.groupId; 

    res.render('../views/events.ejs/criar-eventos', {
        userData: user,
        groupId: groupIdVar 
    });

});


//REGISTERED EVENTS VIEW
router.get('/eventosInscritos', userAuth, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const participationData = await participationModel.findAll({
            attributes: ['eventId'],
            where: { userId: userId } 
        });

        const eventIdsForUser = participationData.map(participation => participation.dataValues.eventId);
        console.log('Event IDs for User:', eventIdsForUser);

        if (eventIdsForUser.length === 0) {
            return res.render('../views/events.ejs/eventos-inscritos', {
                dadosEvents: eventIdsForUser
            });
        }
        
        const events = await eventModel.findAll({
            order: [['id', 'DESC']],
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
            //console.log('nao tem eventos' + events);
        }
    } catch (error) {
        console.log('Error at rendering "eventos-inscritos"', error);
        res.redirect('/homepage');
    };
});


//LOGOUT
router.get('/logout', userAuth, (req, res) =>{
    req.session.id = undefined
    console.log('User LogOut sucess')
    return res.redirect('/login')
})


//EVENTS EDIT VIEW
router.get('/editarEvento', userAuth, async (req, res) =>{
    const eventId = req.query.eventId;

    try{
        const eventsData = await eventModel.findAll({
            where: {
                id: eventId
            }
        });

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
        });
    }
    catch(error){
        console.log('Error at editEvent route' + error);
        return redirect('/homepage');
    };
});


//PROFILE EDIT VIEW
router.get('/editarPerfil', userAuth ,async (req, res) =>{
    const idVar = req.session.user.id;

    if(!idVar){
        return res.status(400).send('User id to edit profile not found');
    }

    const recordData = await recordModel.findAll({
        where: {
            id: idVar     
        }
    });

    const result = await recordData.map(events => ({
        id: events.dataValues.id,
        fullName: events.dataValues.fullName,
        userName: events.dataValues.userName,
        email: events.dataValues.email,
        password: events.dataValues.password,
        image: events.dataValues.image
    }));

    res.render('../views/user.ejs/editar-perfil', {
        recordData: result
    });
});


//MY EVENTS VIEW
router.get('/meusEventos', userAuth, async (req, res) =>{
    try{
        const userIdVar = req.session.user.id;

        const events = await eventModel.findAll({
            order: [['id', 'DESC']],
            where: {
                userId: userIdVar
                /*
                [Op.and]: [
                    {userId: userIdVar}, 
                    { [Op.or]: [
                        { groupId: 0 },{ groupId: { [Op.is]: null } } // correct use of "null" ins sequelize
                    ] }
                ]
                */
            }
        });

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
            });
        }
    }
    catch(error){
        console.log('Error at show your own events', error);
        return res.redirect('/homepage');
    };
});


//GROUPS CREATION VIEW
router.get('/criarGrupos', userAuth, (req, res) => {
    if(req.session.user){
        const user = req.session.user;
        
        res.render('../views/groups.ejs/criar-grupo', {
            userData: user
        });
    }else{
        res.redirect('/login');
    }
});




//SEARCH GROUP VIEW
router.get('/gruposPesquisa', userAuth, async (req, res) =>{
    try{
        const searchQuery = req.query.search; //group name of search at frontend
        const userId = req.session.user.id;
        
        let groups;
        if(searchQuery){
            groups = await groupsModel.findAll({
                order: [
                    ['id', 'DESC']
                ],
                where: {
                    name: {
                        [Op.like]: `%${searchQuery}%` //groups filter with this nameSearch
                    }
                },
                include: [
                    {
                        model: recordModel,
                        as: 'creator', // Alias usado na associação
                        attributes: ['fullName', 'userName', 'image'],
                    },
                    {
                        model: recordModel,
                        as: 'members',  // Inclui os membros do grupo
                        attributes: ['id']
                    }
                ]
            });
        }else{
            groups = await groupsModel.findAll({
                order: [
                    ['id', 'DESC']
                ],
                include: [
                    {
                        model: recordModel,
                        as: 'creator',
                        attributes: ['fullName', 'userName', 'image'],
                    },
                    {
                        model: recordModel,
                        as: 'members',  // Inclui os membros do grupo
                        attributes: ['id']
                    }
                ]
            });
        }
        
        if(!groups || groups.length === 0){
            res.redirect('/gruposPesquisa');
        }
        
        groups.forEach(group => {
            if (group.creator && group.creator.image) {
                // Convertendo a imagem da tabela creator para base64
                group.creator.profileimage = Buffer.from(group.creator.image).toString('base64');
                group.creator.profileimage = `data:image/jpeg;base64,${group.creator.profileimage}`;
            }
            
            if (group.image){
                group.imageBase64 = Buffer.from(group.image).toString('base64');
                group.imageGroup = `data:image/jpeg;base64,${group.imageBase64}`;
            }
        })
        
        res.render('../views/groups.ejs/pesquisar-grupo', {
            grupos: groups,
            searchGroup: searchQuery || '',
            userid: userId,
        });
    }
    catch(error){
        console.log('Error at rendering groups', error);
        return res.status(500).send('Error at rendering groups', error);
    };
});


//GROUPS PARTICIPATE VIEW
router.get('/gruposInscritos', userAuth, async (req, res) => {
    const userIdSession = req.session.user.id;

    try{
        const groupsParticipation = await userGroupsModel.findAll({
            where:{ userId: userIdSession }
        });

        if(!groupsParticipation){
            res.status(404).send('Not Groups participations found');
        }

        //New array with only id's of groups
        const groupsIds = groupsParticipation.map(element => element.dataValues.groupId);

        let groups = await groupsModel.findAll({
            where: {
                id: { [Op.in]: groupsIds }
            },
            include: [
                {
                    model: recordModel,
                    as: 'creator',
                    attributes: ['fullName', 'userName', 'image'],
                },
                {
                    model: recordModel,
                    as: 'members',  // Inclui os membros do grupo
                    attributes: ['id']
                }
            ]
        })

        groups.forEach(group => {
            if (group.creator && group.creator.image) {
                // Convertendo a imagem da tabela creator para base64
                group.creator.profileimage = Buffer.from(group.creator.image).toString('base64');
                group.creator.profileimage = `data:image/jpeg;base64,${group.creator.profileimage}`;
            }
            
            if (group.image){
                group.imageBase64 = Buffer.from(group.image).toString('base64');
                group.imageGroup = `data:image/jpeg;base64,${group.imageBase64}`;
            }
        })

        res.render('../views/groups.ejs/grupos-inscritos', {
            groups
        });
    }
    catch(error){
        console.log('Error at rendering groups participations', error)
        return res.status(500).send('Error at rendering groups participations', error);
    };
});


//MY GROUPS VIEW
router.get('/meusGrupos', userAuth, async (req, res) => {
    const userIdVar = req.session.user.id;

    try{
        const groups = await groupsModel.findAll({
            where: {
                creatorId: userIdVar
            }
        });

        if(!groups){
            return res.status(404).send('Personal groups not found');
        }

        groups.forEach(group => {
            if (group.image){
                group.imageBase64 = Buffer.from(group.image).toString('base64');
                group.imageGroup = `data:image/jpeg;base64,${group.imageBase64}`;
            }
        })

        res.render('../views/groups.ejs/meus-grupos', {
            grupos: groups
        })
    }
    catch(error){
        console.log('Internal server error at rendering My groups view', error);
        return res.status(500).send('Internal server error at rendering My groups view', error);
    };
});


router.get('/acessarGrupo/:groupId', userAuth, async (req, res) => {
    const groupIdVar = req.params.groupId;
    const userId = req.session.user.id;

    try{
        const events = await eventModel.findAll({
            order: [['id', 'DESC']],
            where: {
                groupId: groupIdVar             
            }
        });
        events.forEach(event => {
            if (event.image ) {
                event.imageBase64 = Buffer.from(event.image).toString('base64');
                event.imageEvent = `data:image/jpeg;base64,${event.imageBase64}`;
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
        })

        const profileData = await recordModel.findAll();
        profileData.forEach(data =>{
            if (data && data.image) {
                // Convertendo a imagem da tabela records para base64
                data.profileimage = Buffer.from(data.image).toString('base64');
                data.profileimage = `data:image/jpeg;base64,${data.profileimage}`;
            }
        });

        const groupData = await groupsModel.findOne({
            attributes: ['name'],
            where: {
                id: groupIdVar
            }
        })

        res.render('../views/groups.ejs/acessar-grupo', {
            groupIdVar,
            events,
            profileData,
            userId,
            groupData
        });
    }
    catch(error){
        console.log('Internal server erro at rendering Group Acess view', error);
        return res.status(500).send('Internal server erro at rendering Group Acess view', error);
    };
});


router.get('/editarGrupo', userAuth, async (req, res) => {
    const groupId = req.query.groupId;

    try{
        const groupData = await groupsModel.findAll({
            where: {
                id: groupId
            }
        });

        const result = await groupData.map(data => ({
            id: data.dataValues.id,
            name: data.dataValues.name,
            description: data.dataValues.description,
            creatorId: data.dataValues.creatorId,
            isPublic: data.dataValues.isPublic,
            memberCount: data.dataValues.memberCount,
            rules: data.dataValues.rules,
            image: data.dataValues.image
        }));

        return res.render('../views/groups.ejs/editar-grupo', {
            group: result
        })
    }
    catch(error){
        console.log('Internal server error at rendering group edit view', error);
        return res.status(500).send('Internal server error at rendering group edit view', error);
    };
});


module.exports = router;