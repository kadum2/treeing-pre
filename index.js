

//express tools and configuring
let express = require("express")
let app = express()
let cors = require("cors")
let path = require("path")
const cookieParser = require('cookie-parser');


//express configuration 
app.use(express.json())
app.use(cors())

app.use(cookieParser())
////////mongodb; mongo atlas

let mongodb = require("mongodb").MongoClient
const { ObjectID } = require("bson")
// const { markAsUntransferable } = require("worker_threads")
// let ObjectId = require('mongodb').ObjectID;
require("dotenv").config()
// let mongokey = "mongodb+srv://firstUser:LdUpMsCeuguJLKAe@cluster0.mf8v4.mongodb.net/db2?retryWrites=true&w=majority"



// ///////////local mongodb; mongoose

// let mongoose = require("mongoose")
// const objects = require("./schema/objects")

// mongoose.connect("mongodb://localhost/polyline")
// const db = mongoose.connection

// db.on("error", error=>console.error(error))
// db.once("open", ()=> console.log("connected to mongoose")) // make a call ??

// // schema
// let paths = require("./schema/paths")
// let objects = require("./schema/objects")





////////// pages to send


app.use("/",express.static("./home"))
///////authenticate require page; 

app.use("/mode",(req, res, next)=>{
    if(req.cookies.modeAuth){
        ////send the full page
        console.log(req.cookies.token)
        if(req.cookies.modeAuth == process.env.MODEAUTH){
            console.log("will send the full page")
            next()
        }
    }else{
        ////send the cred making 
        res.send(`    <input type="text" name="" id="em" placeholder="em">
        <button onclick="fetch('/checkmode', {
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                em: document.querySelector('#em').value,
            })
        })
    ">send</button>
    `)
    }
},  express.static("./mode"))


app.post("/checkmode", (req, res)=>{
    console.log("check mode .......",req.body)
    /////check if true auth to give a set the cookie
    if(req.body.em == process.env.MODEAUTH){
        res.cookie("modeAuth", process.env.MODEAUTH);
        // res.redirect("/mode") ///make a reload instead
        res.redirect(req.get("/mode"))
    }else{
        res.sendStatus(400)
    }
})


/////map api key 
app.get("/map-api-key", (req, res)=>{
    res.send({apiKey: process.env.MAPAPIKEY})
})





/////routes 

///confirmed
app.get("/confirmed", (req, res)=>{
    
    
    console.log("get confirmed")

    mongodb.connect(process.env.MONGOKEY, async (err, client)=>{
        let dbb = client.db()

        // let dl = await dbb.collection("confirmed").deleteMany({})

    let results = await dbb.collection("confirmed").find().toArray()
    // let result = []
    // results.forEach(e=>result.push(e.path))
    res.send(results)
    console.log(results)
    })
})

app.post("/confirmed", (req, res)=>{
    
    console.log("..........post confirmed; ",req.body)
    console.log(req.body)

    mongodb.connect(process.env.MONGOKEY, async (err, client)=>{
    let dbb = client.db()


    /////check if not empty 
    if(req.body[0]){
        console.log("not empty to")
        ////insert path by path
        // Object.values(req.body).forEach(async e=> {
            req.body.forEach(async e=>{
            await dbb.collection("confirmed").insertOne({path: e})
            console.log("find the intened path in the unconfirmed", await dbb.collection("unconfirmed").findOne({path: e}))
            await dbb.collection("unconfirmed").findOneAndDelete({path: e})
        })
        let results = await dbb.collection("confirmed").find().toArray()
        console.log(results)
        res.send(results)
    }else{
        console.log("empty not to ")
        res.status(400).send(err)
    }

    })
})



///unconfirmed 
app.get("/unconfirmed", (req, res)=>{
    
    console.log(".........get unoconfirmed")

    mongodb.connect(process.env.MONGOKEY, async (err, client)=>{
    let dbb = client.db()
    let results = await dbb.collection("unconfirmed").find().toArray()
    res.send(results)
    console.log(results)
    })
})

app.post("/unconfirmed", (req, res)=>{
    
    console.log("........post unconfirmed; "+req.body)

    mongodb.connect(process.env.MONGOKEY, async (err, client)=>{
    let dbb = client.db()

    console.log(req.body)
    if(req.body[0]){
        dbb.collection("unconfirmed").insertOne({path: req.body})

        // req.body.forEach(e=>dbb.collection("unconfirmed").insertOne({path: e}))
        // let results = await dbb.collection("unconfirmed").find().toArray()
        // console.log(results)
        // res.send(results)
        res.sendStatus(200)
    }else{
        /////bad request
        res.status(400).send(err)
    }
    })
})


////////deleted 
app.get("/deleted", (req, res)=>{
    
    console.log("..........get deleted")

    mongodb.connect(process.env.MONGOKEY, async (err, client)=>{
        let dbb = client.db()
    let results = await dbb.collection("deleted").find().toArray()
    res.send(results)
    console.log(results)
    })
})

// not working; 

app.post("/deleted", (req, res)=>{
    
    console.log("..........post deleted; ",req.body)

    mongodb.connect(process.env.MONGOKEY, async (err, client)=>{
    let dbb = client.db()

    if(req.body[0]){
        req.body.forEach(e=>{

            console.log(e)
            dbb.collection("deleted").insertOne({path: e})
            dbb.collection("unconfirmed").findOneAndDelete({path: e})
        })
        // let results = await dbb.collection("deleted").find().toArray()
        // console.log(results)
        // res.send()
        res.sendStatus(200)
    }else{
        /////bad request
        res.status(400).send(err)
    }
    })
})



///edit confirmed routes; 
app.post("/editconfirmed", (req, res)=>{
    
    console.log(".........post edit confirmed; ",req.body)

    mongodb.connect(process.env.MONGOKEY, async (err, client)=>{
    let dbb = client.db()

    if(req.body[0]){
    }

    Object.values(req.body).forEach(e=>{
        let found = dbb.collection("confirmed").findOne({_id: ObjectID(e)})
        dbb.collection("deleted").insertOne(found)
        // dbb.collection("confirmed").remove({found})
        dbb.collection("confirmed").findOneAndDelete({_id: ObjectID(e)})
    })

    // Object.values(req.body).forEach(e=>dbb.collection("confirmed").insertOne({path: e}))
    let results = await dbb.collection("deleted").find().toArray()

    res.send(results)
    console.log(results)
    })
})



/// //secure the mode route; make a middleware and check if have the intended
/// intended creds in the header if not send input html 



// app.get("/mode", (req, res)=>{
//     if(req.header.auth){
//         console.log("allow to be mode")
//     }
// })



// deleting from db 
// mongodb.connect(process.env.MONGOKEY, async (err, client)=>{
//     let dbb = client.db()
//     // dbb.collection("confirmed").deleteMany({"path"})
//     dbb.collection("confirmed").deleteMany({"path": {$exists: false}})

// })




///////establishing
app.listen(process.env.PORT || 2000, ()=>console.log("listennig ..."))



