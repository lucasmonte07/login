const session = require("express-session")

export const getSession = (req, res, next) => {     
    if(req.session.login) {
        return res.redirect('/home', {            
        })
    } else {
        return res.redirect('/')
    }
}

export const testLogin = (req, res, next) => {
    if(req.body.email == correo.com && password == 1248) {
        req.session.login = true
        res.redirect('/home')        
    } else {
        res.redirect('/')
    }
}

export const destroySession = (req, res, next) => {
    if(req.session.login) {
    req.session.destroy(() =>{
        res.redirect('/')
    })
  }
}

export const home = (req, res, next) => {
    res.render('/home', {        
    })
}

export const register = async (req, res, next) => {
    const {first_name, last_name, email, age, password} = req.body

    /*
    La password siempre db ir encriptada y se examina por lo gral en el front
    por eso es que acá, aunque ahora no lo vemos hacer, deberíamos chequear
    el resto de los datos haciendo algo asi:

    const user = await userModel.find() 'para buscar el email
    if(user){
        res.redirect('/', {
            Indicar que el mail ya existe
        })
    }else{
        await UserModel.addElement([])
        res.redirect('/', {
            Indicar que el usuario se creo correctamente
        })
    }



    */

}
