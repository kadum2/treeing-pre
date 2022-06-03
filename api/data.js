


require("dotenv").config()

let mongodb = require("mongodb").MongoClient

// mongodb.connect(process.env.MONGOKEY, async (err, client)=>{
//     let dbb = client.db()
//     let results = await dbb.collection("first-collection").find().toArray()
//     console.log(results)
// })


//get

// app.get("/", async (req, res)=>{
//     // let found = await paths.find()
//     // console.log(found)

//     // mongodb.connect(process.env.MONGOKEY, async (err, client)=>{
//     //     let dbb = client.db()
//     // let results = await dbb.collection("first-collection").find().toArray()
//     // res.send(results)

//     // })
// })




//post
// app.post("/", (req, res)=>{
    
//     // let req = await
//     console.log(req.body)
//     console.log("request")

//     mongodb.connect(process.env.MONGOKEY, async (err, client)=>{
//         let dbb = client.db()

//         Object.values(req.body).forEach(e=>dbb.collection("first-collection").insertOne({path: e}))

//         let results = await dbb.collection("first-collection").find().toArray()

//         console.log(results)    
//     })
// })



module.exports = (req, res)=>{
    if(req.method == "GET"){
        res.send("recieved get request with db")

        mongodb.connect(process.env.MONGOKEY, async (err, client)=>{
            let dbb = client.db()
        let results = await dbb.collection("first-collection").find().toArray()
        res.send(results)
    
        })
    



    }else if(req.method == "POST"){
        res.send("reveived post request; "+req.body)

        mongodb.connect(process.env.MONGOKEY, async (err, client)=>{
            let dbb = client.db()
            Object.values(req.body).forEach(e=>dbb.collection("first-collection").insertOne({path: e}))
            let results = await dbb.collection("first-collection").find().toArray()

            console.log(results)    
        })
    




    }
}




