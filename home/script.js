
        ////setting up 

        const map = L.map('map').setView([33.396600, 44.356579], 9); //leaflet basic map

        //// adding search box
        // L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        //   attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        // }).addTo(map);
        L.Control.geocoder().addTo(map);



        // stored data 
        //created objects data; to delete
        let oldObjects = [] ///no need


        /////new containers naming; 
        let pathObjects = [] ///to hover and change color; check more about
        let markers = [] /// list of the labels object
        //path 
        let path = [] ///path points
        let currentPath = [] //path object

        //circles
        let currentLabel
        let point1 =[]
        let point2 =[]

        ////set icons 
        let oldIcon = L.icon({
            iconUrl: "/marker-icon.png",
            shadowSize: [50, 64], // size of the shadow
            shadowAnchor: [4, 62], // the same for the shadow
            iconSize: [25, 41],
            iconAnchor: [12, 41],
        });

        ////getting icon; icon is special object not just an image
        markerIcon = L.icon({
            iconUrl: "/marker-icon-2x-red.png",
            shadowSize: [50, 64], // size of the shadow
            shadowAnchor: [4, 62], // the same for the shadow
            iconSize: [25, 41],
            iconAnchor: [12, 41],
        });





        /////// features 
        //adding 

        let addmode = document.querySelector("#add-mode")
        addmode.addEventListener("click", ()=>addmode.classList.toggle("on"))

        map.addEventListener('click', function (ev) {
            
            if (addmode.classList.contains("on")) {
                let latlng = map.mouseEventToLatLng(ev.originalEvent);
                let i = [latlng.lat, latlng.lng]
                let m = L.marker(i, {
                    icon: oldIcon
                }).addTo(map);
                markers.push(m) 

                ////data to send 
                path.push(i)
                ////map 
                currentPath != 0 ? map.removeLayer(currentPath) : null
                currentPath = L.polyline(path).addTo(map)
                    
                currentLabel = m._latlng


                ////marker 
                m.addEventListener("click", (e) => {
                    // console.log(e)
                    markers.forEach(ee => {
                        ee.setIcon(oldIcon)
                    })
                    e.target.setIcon(markerIcon)
                    currentLabel = e.target._latlng
                })
            }
        });



        //// adding circle; 

        let addCircle = document.querySelector("#add-circle")

        addCircle.onclick = () => {
            // map.marker(currentLabel)

            console.log("addcircle to" + currentLabel)
            let m = L.circle(currentLabel, {
                // color: 'red',
                fillColor: '#3388FF',
                fillOpacity: 0.8,
                radius: 100
            }).addTo(map)

            pathObjects.push(m) ////check if neeeded

            !point1[0]?point1 = [currentLabel.lat, currentLabel.lng]:point2 = [currentLabel.lat, currentLabel.lng]
        }


        //canceling

        //cancel step 

        let cancelStep = document.querySelector("#cancel-step")
        cancelStep.addEventListener("click", () => {

            //data 

            //ui 

            map.removeLayer(markers[markers.length - 1])
            markers.pop()

            path.pop()
            // points.pop()
            map.removeLayer(currentPath)
            currentPath = L.polyline(path).addTo(map)

        })

        //cancel route
        let cancelRoute = document.querySelector("#cancel-route")
        cancelRoute.addEventListener("click", () => {
            //data 

            path = []
            map.removeLayer(currentPath)
            currentPath = undefined
            console.log(currentPath)

            markers.forEach(e => map.removeLayer(e))
            markers =[]
            console.log(markers)

        })


        ///////sending 


        let send = document.querySelector("#send")
        send.addEventListener("click", () => {

            if(path[0]){
                fetch("/unconfirmed", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(path)
                })
                path = []
            }
            if(point1[0]){
                fetch("/unconfirmed", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(point1)
                })
                point1 = []
            }
            if(point2[0]){
                fetch("/unconfirmed", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(point2)
                })
                point2 = []
            }
        })




        //get data and deploy them; get the unconfirmed ones 

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



            ///fetching data; 
            let d = await fetch("/confirmed")
            let pd = await d.json()
            console.log("get routes; ", pd)

            Object.values(pd).forEach(e=>console.log(e.path))

            ///deploy them; store
            Object.values(pd).forEach(e => {

                let obje 

                if(typeof e.path[0]!="number"){

                    console.log(e.path)
                    obje = L.polyline(e.path, {
                        // color: "red",
                    }).addTo(map)
                    // oldObjects.push(pathId) //dont need old objects
                    // pathob.addEventListener("click", (e) => console.log(e.target))
                } else { ////labels part 
                    console.log("....label....")

                    obje = L.circle(e.path, {
                        fillColor: '#3388FF',
                        fillOpacity: 0.8,
                        radius: 100
                    }).addTo(map)
                }

                pathObjects.push(obje)
                obje.addEventListener("mouseover", (e)=>{
                    pathObjects.forEach(e=>{e.setStyle({color: "#3388FF", fillColor: "#3388FF"})})
                    e.target.setStyle({color:"rgb(223, 39, 39)", fillColor: "rgb(223, 39, 39)"})
                })
                obje.addEventListener("click", (e)=>{
                    pathObjects.forEach(e=>{e.setStyle({color: "#3388FF", fillColor: "#3388FF"})})
                    e.target.setStyle({color:"rgb(223, 39, 39)", fillColor: "rgb(223, 39, 39)"})
                })
            })
        }



        //////////// test code; 

        window.onclick = ()=>{
            console.log(path)
            // console.log(ps)
            // console.log(labelList)
        }



