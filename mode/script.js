

    //map setup; 

    //leaflet basic map
    const map = L.map('map').setView([33.396600, 44.356579], 10);

    //////setting pathcards and circlecards options; need edit 
    document.querySelector("#paths").addEventListener("click", () => {
        document.querySelector("#circleCards").style.display = "none"
        document.querySelector("#pathCards").style.display = "block"
    })

    document.querySelector("#endpoints").addEventListener("click", () => {
        document.querySelector("#pathCards").style.display = "none"
        document.querySelector("#circleCards").style.display = "block"
    })

    document.querySelector("#unconf").addEventListener("click", ()=>{
        document.querySelector("#pathCards").style.display = "none"
        document.querySelector("#circleCards").style.display = "none"

        document.querySelector("#confPathCards").style.display = "block"
        document.querySelector("#confCircleCards").style.display = "block"

    })
    document.querySelector("#conf").addEventListener("click", ()=>{
        document.querySelector("#pathCards").style.display = "block"
        document.querySelector("#circleCards").style.display = "block"

        document.querySelector("#confPathCards").style.display = "none"
        document.querySelector("#confCircleCards").style.display = "none"
    })
    


    //////data storing;

    ///linking list; may no need
    let linkedRoutes = []
    let linkedLabels = []
    let linkedRoutes2 = []
    let linkedLabels2 = []

    let confirmedLinkedList = []
    let unconfirmedLinkedList = []

    /////data to send 
    let confirmed = []
    let deleted = []
    let deletedIds = [] /// ids to delete from confirmed collection; need edit 

    let currentObject


    /////delete current object; 
    let deleteCurrent = document.querySelector("#deleteCurrent")
    deleteCurrent.addEventListener("click", (e) => {
        console.log(linkedLabels)

        if (linkedLabels.filter(i => {
                i[0] == currentObject;
                return i
            }) || linkedRoutes.filter(i => {
                i[0] == currentObject;
                return i
            })) {
            let ret = clicking(currentObject, linkedLabels)
            deleted.push(ret[0]._latlng)
        } else if (linkedLabels2.filter(i => {
                i[0] == currentObject;
                return i
            }) || linkedRoutes2.filter(i => {
                i[0] == currentObject;
                return i
            })) {
            let ret = clicking(currentObject, linkedLabels)
            deletedIds.push(ret[2])
        }
    })


    /////eventlistener functions 
    function hovering(target, list) {

        // console.log(target, list)
        ////set the non selected colors
        list.forEach(e => {
            e[0].setStyle({
                color: "#3261a8"
            })
            e[1].style.background = "#3261a8"
        })
        ///// get the intended array of the related doms 
        let ret = list.filter(e => {
            return e[0] == target || e[1] == target;
        })
        /////perform the change 
        ret[0][0].setStyle({
            color: "red"
        })

        // map.fitBounds(ret[0][0]._bounds);

        // ret[0][0].getLatLng
        // console.log(ret[0][0])

        ret[0][1].style.background = "red"

        return ret[0][0]
    }

    function clicking(target, list) {
        //removing from ui 
        let ret = list.filter(e => {
            return e[0] == target || e[1] == target;
        })

        // console.log(ret)
        map.removeLayer(ret[0][0])
        ret[0][1].remove()
        // console.log(ret[0][0]._latlngs)

        return ret[0]
    }



    window.onload = async () => {

    //////get api key 
    let rApiKey = await fetch("/map-api-key")
    let apiKey = await rApiKey.json()
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: apiKey.apiKey
}).addTo(map);

L.Control.geocoder().addTo(map);



    //get data; unconfirmed paths, labels 

        let data = await fetch("/unconfirmed")
        let unconfirmed = await data.json()

        console.log("get unconfirmed; ", Object.values(unconfirmed))

        Object.values(unconfirmed).forEach(e => {

                console.log("will create routes", e.path[0])

                ////create the object 
                let theObject
                if(typeof e.path[0]!="number"){
                    theObject = L.polyline(e.path).addTo(map)
                }else{
                    theObject= L.circleMarker(e.path, {
                        fillColor: '#3388FF',
                        fillOpacity: 0.8,
                        radius: 10
                    }).addTo(map)    
                }


                //create card
                let card = document.createElement("div")
                card.classList.add("card")
                let addbtn = document.createElement("button")
                addbtn.classList.add("addbtn")
                addbtn.textContent = "confirm"
                let dlbtn = document.createElement("button")
                dlbtn.classList.add("dltbtn")
                dlbtn.textContent = "delete"
                card.append(addbtn, dlbtn)
                document.querySelector("#pathCards").append(card)
                //create linked list
                unconfirmedLinkedList.push([theObject, card])
                //add event listeners and their arguments

                ///hovering method; 
                card.addEventListener("mouseover", (e) => {
                    // let ret = hovering(e.target, unconfirmedLinkedList)
                    // map.fitBounds(ret._bounds);

                                        // console.log("hovering confirmed")
                                        let ret = hovering(e.target, unconfirmedLinkedList)

                                        // console.log("theObject is; ", ret)
                                        let bounds 
                                        ret._bounds?bounds = ret._bounds:bounds=ret._latlng.toBounds(400)
                                        // console.log(bounds)
                                        map.fitBounds(bounds);
                    
                })
                theObject.addEventListener("mouseover", (e) => {
                    hovering(e.target, unconfirmedLinkedList)
                })
                theObject.addEventListener("click", (e) => {
                    currentObject = e.target
                })

                ///clicking method; 
                addbtn.addEventListener("click", (e) => {
                    let ret = clicking(e.target.parentElement, unconfirmedLinkedList)
                    // confirmed.push([ret[0]._latlng.lat, ret[0]._latlng.lng])

                    ret[0]._latlng?confirmed.push([ret[0]._latlng.lat, ret[0]._latlng.lng]):confirmed.push(ret[0]._latlngs.map(ee=>[ee.lat, ee.lng]))
                })
                dlbtn.addEventListener("click", (e) => {
                    let ret = clicking(e.target.parentElement, unconfirmedLinkedList)
                    // console.log(ret[0]._latlngs.map(ee=>[ee.lat, ee.lng]))
                    ret[0]._latlng?deleted.push([ret[0]._latlng.lat, ret[0]._latlng.lng]):deleted.push(ret[0]._latlngs.map(ee=>[ee.lat, ee.lng]))
                    
                })
        })









        ////getting confirmed

        let cdata = await fetch("/confirmed")
        let pcdata = await cdata.json()

        console.log("get confirmed", pcdata)

        Object.values(pcdata).forEach(e => {


                console.log("will create routes")
                
                //create the object 

                let theObject

                if(typeof e.path[0]!="number"){
                    theObject = L.polyline(e.path).addTo(map)
                }else{
                    theObject = L.circleMarker(e.path, {
                        fillColor: '#3388FF',
                        fillOpacity: 0.8,
                        radius: 10
                    }).addTo(map)
                }

                //create card
                let card = document.createElement("div")
                card.classList.add("card")
                let dlbtn = document.createElement("button")
                dlbtn.classList.add("dltbtn")
                dlbtn.textContent = "delete"
                card.append(dlbtn)
                document.querySelector("#confPathCards").append(card)


                //create linked list
                confirmedLinkedList.push([theObject, card, e._id])
                //add event listeners and their arguments

                ///hovering method; 
                card.addEventListener("mouseover", (e) => {
                    // console.log("hovering confirmed")
                    let ret = hovering(e.target, confirmedLinkedList)
                    let bounds 
                    ret._bounds?bounds = ret._bounds:bounds=ret._latlng.toBounds(400)
                    map.fitBounds(bounds);
                })


                theObject.addEventListener("mouseover", (e) => {
                    hovering(e.target, confirmedLinkedList)
                })
                theObject.addEventListener("click", (e) => {
                    currentObject = e.target
                })

                dlbtn.addEventListener("click", (e) => {

                    let ret = clicking(e.target.parentElement, confirmedLinkedList)
                    deletedIds.push(ret[2])
                })
        })
    }



    ////sending data 
    let send = document.querySelector("#send")
    send.addEventListener("click", async () => {

        console.log("confirmed",!confirmed[0], "deleted", !deleted[0], "deletedIDs", !deletedIds[0])

        //// confirmed labels; 
        if(confirmed[0]){
            console.log("will send confiremd; ",confirmed)

            await fetch("/confirmed", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(confirmed)
            })
            confirmed = []
        }else{
            console.log("will not send confirmed; ", Boolean(confirmed[0]))
        }

        //////deleted 
        if(deleted[0]){
            await fetch("/deleted", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(deleted)
            })
            deleted = []
        }else{
            console.log("will not send deleted; ", Boolean(deleted[0]))
        }

        ////deleted ids 
        if(deletedIds[0]){
            await fetch("/editconfirmed", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(deletedIds)
            })
            deletedIds = []
        }else{
            console.log("will not send deletedID; ", Boolean(deletedIds[0]))
        }
    })



    /////test code; 

    window.onclick = () => {
        console.log("confirmed routes", confirmed)
        console.log("deleted routes", deleted)
        // console.log("confirmed labels", confirmedLabels)
    }

