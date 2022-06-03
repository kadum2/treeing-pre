

//express tools and configuring
let express = require("express")
let app = express()
let cors = require("cors") /////to remove later
// const path = require("path")
// const fs = require("fs")
const multer  = require("multer") 
let bodyParser = require('body-parser')
let cookieParser = require("cookie-parser")


app.use(cookieParser())
app.use(cors())    /////to remove 
app.use(express.json());
app.use(express.urlencoded({ extended: false }))



////////mongodb; mongo atlas
let mongodb = require("mongodb").MongoClient  ///mongodb atlas
const { ObjectID } = require("bson") 
require("dotenv").config()


////////// pages to send
app.use(express.static("./public-imgs"))
app.use("/", express.static("./home"))

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
}, express.static("./mode"))


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


//////multer; middleware to reset the imgs container 
////make it valid for both finished and unfinished; condition the filedname
let beforeImgs = []
let afterImgs = []
let basicStoringPlan = multer.diskStorage({
    destination: "./public-imgs",
    filename: async (req, file, cb)=>{
        console.log(file)

        if(file.fieldname == "bImgs"){
            let path = await new Date().toISOString().replace(/:/g, '-') +file.originalname.replaceAll(" ", "")
            beforeImgs.push(path)
            cb(null, path)
        }
        if(file.fieldname == "aImgs"){
            let path = await new Date().toISOString().replace(/:/g, '-') +file.originalname.replaceAll(" ", "")
            afterImgs.push(path)
            cb(null, path)
        }
    }
})
let multerBasic = multer({storage: basicStoringPlan})




////getting map api key; 

app.get("/map-api-key", (req, res)=>{
    res.send({apiKey: process.env.MAPAPIKEY})
})


///////plan; 
//////home 
///get confirmed; finished, unfinished 
app.get("/con-finished", async (req, res)=>{
    console.log("............get con-finished.........")
    mongodb.connect(process.env.MONGOKEY, async (err, client)=>{
    let dbb = client.db()
    let result = await dbb.collection("con-finished").find({}).toArray()
    res.send(result)
    })
})
app.get("/con-unfinished", async (req, res)=>{
    console.log("............get con-unfinished..........")
    mongodb.connect(process.env.MONGOKEY, async (err, client)=>{
    let dbb = client.db()
    let result = await dbb.collection("con-unfinished").find({}).toArray()
    res.send(result)
    })
})

///get
app.get("/uncon-finished",(req, res)=>{
    ///check if valid token 
    if(req.cookies.modeAuth == process.env.MODEAUTH){
        mongodb.connect(process.env.MONGOKEY, async (err, client)=>{
            let dbb = client.db()
            let result = await dbb.collection("uncon-finished").find().toArray()
            res.send(result)
        })
    }else{
        res.sendStatus(401)
    }
})

app.get("/uncon-unfinished",(req, res)=>{
        if(req.cookies.modeAuth == process.env.MODEAUTH){
            mongodb.connect(process.env.MONGOKEY, async (err, client)=>{
                let dbb = client.db()
                let result = await dbb.collection("uncon-unfinished").find().toArray()
                res.send(result)
            })
        }else{
            res.sendStatus(401)
        }
})



////unfinished; mode 
app.post("/con-unfinished", (req, res, next)=>{beforeImgs= []; afterImgs = []; next()}, multerBasic.array("bImgs"), (req, res)=>{
    console.log(req.body)

    ////if mode save it in con; else in uncon 
    if(req.cookies.modeAuth == process.env.MODEAUTH){
        if(typeof beforeImgs[0] == "string"){
            console.log("valid data")
            mongodb.connect(process.env.MONGOKEY, async (err, client)=>{
                let dbb = client.db()
                await dbb.collection("con-unfinished").insertOne({
                    coords: req.body.coords.split(","),
                    bName: req.body.names, 
                    beforeImgs: beforeImgs,
                    afterImgs: afterImgs, 
                    aNames: []
                })
                })
            res.sendStatus(200)
        }else{
            res.sendStatus(400)
        }
    }else{
        res.sendStatus(401)
    }
})

/////unfinished; home 
app.post("/uncon-unfinished", (req, res, next)=>{beforeImgs= []; afterImgs = []; next()}, multerBasic.any(), (req, res)=>{
    console.log(req.body)

    ////if mode save it in con; else in uncon 
        if(typeof beforeImgs[0] == "string"){
            console.log("valid data")
            mongodb.connect(process.env.MONGOKEY, async (err, client)=>{
                let dbb = client.db()
                await dbb.collection("uncon-unfinished").insertOne({
                    coords: req.body.coords.split(","),
                    bName: req.body.names, 
                    beforeImgs: beforeImgs,
                    afterImgs: afterImgs, 
                    aNames: []
                })
                })
            res.sendStatus(200)
        }else{
            res.sendStatus(400)
        }
})

/////finished; mode 
app.post("/con-finished", (req, res, next)=>{beforeImgs= []; afterImgs = []; next()},multerBasic.any(), (req, res)=>{
    console.log(req.body)
    console.log(beforeImgs)
    console.log(afterImgs)

    ////if mode save it in con; else in uncon 
    if(req.cookies.modeAuth == process.env.MODEAUTH){
        if(typeof beforeImgs[0] == "string" &&typeof afterImgs[0] == "string" ){
            console.log("valid data")
            mongodb.connect(process.env.MONGOKEY, async (err, client)=>{
                let dbb = client.db()
                await dbb.collection("con-finished").insertOne({
                    coords: req.body.coords.split(","),
                    bName: [], 
                    beforeImgs: beforeImgs,
                    afterImgs: afterImgs, 
                    aNames: req.body.names.split(",")
                })
                })
            res.sendStatus(200)
        }else{
            res.sendStatus(400)
        }
    }else{
        res.sendStatus(401)
    }
})

/////finished; home
app.post("/uncon-finished", (req, res, next)=>{beforeImgs= []; afterImgs = []; next()},multerBasic.any(), (req, res)=>{
    console.log(req.body)
    console.log(beforeImgs)
    console.log(afterImgs)

    ////if mode save it in con; else in uncon 
        if(typeof beforeImgs[0] == "string" &&typeof afterImgs[0] == "string" ){
            console.log("valid data")
            mongodb.connect(process.env.MONGOKEY, async (err, client)=>{
                let dbb = client.db()
                await dbb.collection("uncon-finished").insertOne({
                    coords: req.body.coords.split(","),
                    bName: [], 
                    beforeImgs: beforeImgs,
                    afterImgs: afterImgs, 
                    aNames: req.body.names.split(",")
                })
                })
            res.sendStatus(200)
        }else{
            res.sendStatus(400)
        }
})


////finish the loc
    /// get the old loc from con-un; add imgs to afterImgs; add the new one to
    /// con-fi; remove the old one from con-un
    app.post("/finishing", (req, res)=>{

    })




///mode; for each route check if it is the moderator by checking valid token 


///confirm
app.post("/confirm", (req, res)=>{
    console.log("......confirm.....")
    mongodb.connect(process.env.MONGOKEY, async (err, client)=>{
    let dbb = client.db()
    ////check req.body.type, req.body.id or if(){}; find by id
    if(await dbb.collection("uncon-unfinished").findOne({_id: ObjectID(req.body.id)})){
        /////add to con side

        /////remove from uncon side 
        
    }else if(await dbb.collection("uncon-finished").findOne({})){

    }else{

    }
    
    })
})


////delete the loc; get the id 
    ////remove by id 
app.post("/delete", (req, res)=>{

})


app.post("/definishing", (req, res)=>{

})


///////////test code
// mongodb.connect(process.env.MONGOKEY, async (err, client)=>{
//             let dbb = client.db()
// })




app.listen(process.env.PORT || 3500, ()=>console.log(`listening on port ???`))

