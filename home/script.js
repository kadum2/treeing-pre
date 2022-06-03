///////////////////////////////////////////////////////////////////////
////setting up 

const map = L.map('map').setView([33.396600, 44.356579], 9); //leaflet basic map

        ////////the required labels
        let uncon = L.icon({
            iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
            shadowSize: [50, 64], // size of the shadow
            shadowAnchor: [4, 62], // the same for the shadow
            iconSize: [25, 41],
            iconAnchor: [12, 41],
        });

        ////getting icon; icon is special object not just an image
        let conFinished = L.icon({
            iconUrl: "https://github.com/pointhi/leaflet-color-markers/blob/master/img/marker-icon-2x-green.png?raw=true",
            shadowSize: [50, 64], // size of the shadow
            shadowAnchor: [4, 62], // the same for the shadow
            iconSize: [25, 41],
            iconAnchor: [12, 41],
        });
        let conUnfinished = L.icon({
            iconUrl: "https://github.com/pointhi/leaflet-color-markers/blob/master/img/marker-icon-2x-red.png?raw=true",
            shadowSize: [50, 64], // size of the shadow
            shadowAnchor: [4, 62], // the same for the shadow
            iconSize: [25, 41],
            iconAnchor: [12, 41],
        });




/////data containers and main elements 

let currentCoords
let currentId
let message = document.querySelector("#message")
let m


/////getting data; fetch confirmed; finished, unifinished 
////display data; red and green labels and imgs; based on the ????

window.onload = async ()=>{

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

    //////get con-finished; use green pin, before imgs, after imgs 

    let confi= await fetch("/con-finished")
    let pconfi= await confi.json()
    console.log(pconfi)
    pconfi[0]?insertLocs(pconfi, conFinished ):null
    // Object.entries(pconfi).length != 0?insertLocs(pconfi):null
    // if(pconfi){insertLocs(pconfi)}

    /////get con-unfinished; use red pin, current imgs

    let conun= await fetch("/con-unfinished")
    let pconun = await conun.json()
    console.log(pconun)
    pconun[0]?insertLocs(pconun, conUnfinished ):null
    // Object.entries(pconfi).length != 0?insertLocs(pconfi):null


    /////get con-unfinished; use red pin, current imgs

}


/////insert data; make function to insert data 
let linkedList = []
let beforeImgsElements = []
let afterImgsElements = []

function insertLocs (dataList, pin){

    ////make marker, insert in map, insert in linkedlist; make the label functionality 
    ////make imgs, insert in containers (profile), insert in linkedlist
    ////insert id in linked list 

    dataList.forEach(e=>{
        let m = L.marker(e.coords, {
            icon: pin
        }).addTo(map);

        m.addEventListener("click", (e)=>{

            document.querySelector("#beforeImgs").innerHTML = ""
            document.querySelector("#bContributers").innerHTML = "" 
            document.querySelector("#afterImgs").innerHTML = ""
            document.querySelector("#aContributers").innerHTML = "" 


            linkedList.forEach(ee=>{
                if(ee.m == e.target){
                    
                    ////beforeImgs inserting; three imgs
                    for(let i = 0; i<3; i++){
                        document.querySelector("#beforeImgs").append(ee.beforeImgsElements[i])
                    }

                    //////before contributers
                    document.querySelector("#bContributers").innerHTML = `
                    <div class="contri">
                        <h4 class="contributerName">${ee.bName}</h4>
                    </div>`

                    /////after;
                    for(let i = 0; i<3; i++){
                        document.querySelector("#afterImgs").append(ee.afterImgsElements[i])
                    }

                    document.querySelector("#aContributers").innerHTML = `
                    <div class="contri">
                        <h4 class="contributerName">${ee.aNames}</h4>
                    </div>`

                }
            })
        })

        beforeImgsElements = []
        e.beforeImgs.forEach(e=>{
            let img = document.createElement("img")
            img.style.backgroundImage = `url('../${e}')`
            img.style.backgroundSize = "cover"
            img.style.backgroundPosition = "center"

            beforeImgsElements.push(img)
            
        })
        afterImgsElements = []

        if(e.afterImgs[0]){

            for(let i = 0; i<4; i++){

                let img = document.createElement("img")
                img.style.backgroundImage = `url('../${e.afterImgs[i]}')`
                img.style.backgroundSize = "cover"
                img.style.backgroundPosition = "center"
                afterImgsElements.push(img)
            }
        }

        linkedList.push({m:m, beforeImgsElements: beforeImgsElements, id: e.id, afterImgsElements: afterImgsElements, bName: e.bName, aNames: e.aNames})
    })

}






/////adding loc
document.querySelectorAll(".addCoords").forEach(e=>{
    e.onclick = () => {
        document.querySelector(".addCoords").classList.toggle("red")
    }})
    
    map.addEventListener('click', function (ev) {
        m?map.removeLayer(m):null
        if (addUnconUnfinishedCoords.classList.contains("red")) {
            let latlng = map.mouseEventToLatLng(ev.originalEvent);
            let i = [latlng.lat, latlng.lng]
            m = L.marker(i, {
                icon: uncon
            }).addTo(map);
    
            currentCoords = i
        }
    });

////send data 


document.querySelectorAll(".send").forEach(ee=>{

    ee.onclick= async (e)=>{
        console.log(currentCoords)
        console.log(e.target.parentElement.children)
    
        //////check if exist then empty them 
    
        let children = e.target.parentElement.children
    
        let aChildren = [...children]
        aChildren.forEach(e=>console.log(e))
    
    
    
        if((currentCoords || currentId) && children[3].files[0] && children[3].files[1] && children[3].files[2]){
    
            message.innerHTML = ""
            // console.log(children[3].files)
            let fd = new FormData()
    
            /////coords 
            e.target.getAttribute("id") == "sendUnfinished" || e.target.getAttribute("id") == "sendFinished"?fd.append("coords", currentCoords):fd.append("coords", currentId)
    
            /////imgs 
            if(aChildren.find(e=>e.getAttribute("class") == "addBImgs")){
                console.log("found b img", aChildren.find(e=>e.getAttribute("class") == "addBImgs").files)
                for (let i of aChildren.find(e=>e.getAttribute("class") == "addBImgs").files) {
                    fd.append(`bImgs`, i);
                }
                }
            if(aChildren.find(e=>e.getAttribute("class") == "addAImgs")){
                console.log("found a img", aChildren.find(e=>e.getAttribute("class") == "addAImgs").files)
                for (let i of aChildren.find(e=>e.getAttribute("class") == "addAImgs").files) {
                    fd.append(`aImgs`, i);
                }
                }
    
            /////names 
            fd.append("names", aChildren.find(e=>e.getAttribute("class") == "names").value)
    
            console.log(fd)
    

            ///send 
            if(e.target.getAttribute("id")=="sendUnfinished"){
                console.log("sending")
                await fetch("/uncon-unfinished", {
                    method: "POST", 
                    body: fd
                })
            }else if(e.target.getAttribute("id")=="sendFinished"){
                await fetch("/uncon-finished", {
                    method: "POST", 
                    body: fd
                })
            }else if (e.target.getAttribute("id")=="sendFinishing"){
                await fetch("/uncon-finishing", {
                    method: "POST", 
                    body: fd
                })
            }
    
    
    
    
            ////empty 
        ////empty 
        aChildren.find(e=>e.getAttribute("class") == "names").value = ""
        if(aChildren.find(e=>e.getAttribute("class") == "addAImgs")){aChildren.find(e=>e.getAttribute("class") == "addAImgs").files = null}
        if(aChildren.find(e=>e.getAttribute("class") == "addBImgs")){aChildren.find(e=>e.getAttribute("class") == "addBImgs").files = null}
        

        map.removeLayer(m)
        currentCoords = ""
        }else{
            message.innerHTML = "fill the rest input"
        }
    }
    })
    




