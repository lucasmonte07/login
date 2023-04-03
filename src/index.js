
import 'dotenv/config';
import express from 'express';
import routerProd from './routes/FileSystem/products.js';
import routerCart from './routes/FileSystem/cart.js';
import routerMsgChat from './routes/MongoDB/msgchat.js'
import routerCartMDB from './routes/MongoDB/cart.js'
import routerProdMDB from './routes/MongoDB/producto.js'
import { __dirname } from './path.js';
import { engine } from 'express-handlebars';
import * as path from 'path';
import { Server }  from 'socket.io';
import ProductManager from './dao/controllers/FileSystem/PManager.js';
import mongoose from 'mongoose';
import ManagerMsgMongoDB from './dao/controllers/MongoDB/MMManager.js'
import ManagerProdMongoDB from './dao/controllers/MongoDB/MPManager.js'
import { prodModel } from './dao/models/MongoDB/Producto.js';
import cookieParser from 'cookie-parser'
import session from 'express-session'
//import FileStore from 'session-file-store'
import MongoStore from 'connect-mongo'
//import routerSession from './routes/session/users.js'

const MMMDB = new ManagerMsgMongoDB()
const MPMDB = new ManagerProdMongoDB()
//const MCMDB = new ManagerCartMongoDB()

const listaprod = new ProductManager()

console.log(__dirname)

//const fileStorage = FileStore(session)

const app = express();
const PORT = 4000;

const server = app.listen(PORT, () => {
    console.log(`Server on Port ${PORT}`)
})

const io = new Server(server)

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(session({
    //store: new fileStorage({path:'./sessions', ttl: 30000, retries: 1}),
    store: MongoStore.create({
        mongoUrl: process.env.URLATLAS, 
        mongoOptions: {useNewUrlParser: true, useUnifiedTopology: true}, 
        ttl: 30
    }),
    
    secret: process.env.SESSION_SECRET, 
    resave: true, 
    saveUninitialized: true
}))







//app.use('api/session', routerSession)










//app.use(cookieParser) 
app.engine("handlebars", engine()) //config hbs
app.set("view engine", "handlebars") // elementos
app.set("views", path.resolve(__dirname,  "./views")) //rutas


//Socket.io
io.on("connection", (socket)=> {
    
    console.log("conexión con socket")    
    
    socket.on('mensaje', info => {
    console.log(info)
    })    
    
    //realtimeproducts
    socket.on('mi-envio', async info2 => {             
        await listaprod.addProduct(info2)        
        io.emit("publicar", info2)
        console.log(info2)
    })    

    //chats
    socket.on('env-chat', async info3 => {    
        io.emit("publichat", info3)
        MMMDB.addElements([info3])        
        console.log(info3)
    })

    //gestorProductos
    socket.on('env-prod', async info4 => {    
        io.emit("publiprod", info4)
        MPMDB.addElements([info4])
        console.log(info4)
    })
})



//Routes
app.use('/api/product', routerProd)
app.use('/api/cart', routerCart)
app.use('/api/cartMDB', routerCartMDB)
app.use('/api/productMDB', routerProdMDB)
app.use('/chat/msg', routerMsgChat)
app.use('/', express.static(__dirname + '/public'))
app.use('/realtimeproducts', express.static(__dirname + '/public'))
app.use('/chat', express.static(__dirname + '/public'))
app.use('/gestorProducts', express.static(__dirname + '/public'))


//Cookies
app.get('/setCookie', (req, res) => {
    res.cookie('CookieMuestra', 'Aqui esta la cookie', { maxAge:50000, 
    signed:true }).send('Cookie')
})

app.get('/getCookie', (req, res) => {
    res.send(req.signedCookies)
})


//Session
app.get('/session', (req, res) => {
    if(req.session.counter) {
        req.session.counter++
        res.send(`Ya ha ingresado ${req.session.counter} veces`
    ) } else {
        req.session.counter = 1
        res.send("Bienvenido")
    }
})

app.get('/login', (req, res) => {
    const {email, password} = req.body
    if(email == "correo.com" && password == 1248) {
        req.session.email = email
        req.session.password = password
        return res.send("Login")
    }
    return res.send ("Login erroneo")
})


app.get('/logout', (req, res) => {
    req.session.destroy(() => {        
        res.send("Hasta pronto")
    })
})




//renderizado de productos
app.get('/', async (req,res) => {
    const productlist = await listaprod.getProduct() 
    res.render("home", {
       titulo: "CoderHouse-Home",
       productlist
    })
})

//vista realtimeproducts
app.get('/realtimeproducts', async (req,res) => {
    const productlist2 = await listaprod.getProduct()
    res.render("realtimeproducts", {
       titulo: "CoderHouse-realTimeProducts",                             
       productlist2 
    })
})

//vista chats
app.get('/chat', async (req,res) => {
    res.render("chat", {
       titulo: "CoderHouse-chat",                             
    })
})

//vista gestorProducts
app.get('/gestorProducts', async (req,res) => {
    //const productlist4 = await MPMDB.getElements()
    res.render("gestorProducts", {
       titulo: "CoderHouse- Gestor Products",                             
    //productlist4 
    })
})

/* Agregaciones - lo comento para que no se ejecute todo el tiempo.
const rep = await prodModel.aggregate([
    {
        $match: {category: "Running"}
    },
    {
        $group: {_id: "$title", totalquantity: {$sum: ("$stock")}}
    },
    {
        $sort: {totalquantity: 1} // -1 de < a >,  +1 de > a <
    },
    {
        $group: {_id:1,  stock: {$push: "$$ROOT"}}
    },
    {
        $project: {
            "_id": 0,
            stock: "$stock"
        }
    },
    {
        $merge: {
            into: "reporte"
        }
    }
]
)

console.log(rep)
*/

/* Paginación - lo comento para que no se este ejecutando todo el tiempo
const resultados = await prodModel.paginate({title: "NIKE"}, 
{limit:2, paginate: 1})
console.log(resultados)
*/



/* Conexión directa con Mongo - No lo borro por las dudas lo necesite - 
mongoose.connect('mongodb+srv://lucasmongodb01:coderhouse@cluster0.kaodtyu.mongodb.net/?retryWrites=true&w=majority')
.then(mensaje => console.log("MongoDB ATLAS conectado") )
.catch(error => console.log(error.mensaje))
*/
