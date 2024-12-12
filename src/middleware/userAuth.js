

function userAuth(req, res, next){
    if(req.session.user != undefined){
        next()
        console.log('Middleware auth sucess')
    }else{
        res.redirect('/login')
        console.log('Middleware auth error')
    }
};

module.exports = userAuth;