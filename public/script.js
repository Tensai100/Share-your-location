const POST_API_URL = 'https://jsonblob.com/api/jsonBlob';
const PUT_API_URL = 'https://jsonblob.com/api/jsonBlob/6cd58faf-76fd-11ea-9f37-8fe0a9c46af3';
const GET_API_URL = 'https://jsonblob.com/api/jsonBlob/ab2efaf9-76f1-11ea-9f37-3587096b5ed1';

let lat;
let lon;
const mymap = L.map('issMap').setView([32.292122, -9.198271], 6);

//Creating map
L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }
).addTo(mymap);

const myIcon = L.icon({
    iconUrl: './icon256.png',
    iconSize: [64, 64],
    iconAnchor: [32, 80],
    popupAnchor: [0, -60] // point from which the popup should open relative to the iconAnchor
});

const iconYc = L.icon({
    iconUrl: 'https://pbs.twimg.com/profile_images/1029034688323743744/JDOO6a6K_400x400.jpg',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -10] // point from which the popup should open relative to the iconAnchor
});


//Making init markers
const markerYC = L.marker([32.292995, -9.235207], { icon: iconYc }).addTo(mymap);
markerYC.bindPopup('YouCode');

let clickMarker;
mymap.on('click', e => {
    const clickLocation = e.latlng;
    clickMarker = L.marker([clickLocation.lat, clickLocation.lng], { icon: myIcon }).addTo(mymap);
    // mymap.removeLayer(clickMarker);
});



//Get location
getLocation();
function getLocation(){
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async position => {
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            document.getElementById('lat').textContent = lat;
            document.getElementById('lon').textContent = lon;
            mymap.setView([lat, lon], 6);
        });
    }
    else {
        console.log('geolocation IS NOT available');
    }
}


async function refreshData() {    

    const data = await (await fetch(GET_API_URL)).json();
    const markers = [];
    const ids = [];
    for (let id in data) {
        markers.push(L.marker([data[id].lat, data[id].lon], { icon: myIcon }));
        ids.push(id);
    }

    for (let i = 0; i < markers.length; i++) {
        markers[i].addTo(mymap);
        markers[i].bindPopup(data[ids[i]].name);
    }
}


setInterval(refreshData, 1000);







//Sharing location
const isHTML = RegExp.prototype.test.bind(/^(<([^>]+)>)$/i);

async function share() {
    //Name verifications
    const name = document.getElementById('name').value;
    if (name.length <= 0 || isHTML(name)) {
        document.getElementById('infos').innerHTML = 'Invalid name!';
        document.getElementById('infos').style.color = 'red';
        return;
    }


    //POST a new JSON file and get its Location_url
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({ name, lat, lon })
    }

    const response = await (await fetch(POST_API_URL, options));
    const location_url = response.headers.get('Location');
    console.log(location_url);



    //Get existing (PUT) JSON file    
    let jsonData = {};
    try {
        jsonData = await (await fetch(PUT_API_URL)).json();
        console.log('oldJson: ' + jsonData);
    }
    catch (err) { console.log('Geting existing json: ' + err); }



    //Adding 
    const randomId = Date.now().toString();
    jsonData[randomId] = location_url;
    console.log(jsonData);

    options = {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(jsonData)
    }

    const res = await fetch(PUT_API_URL, options);
    console.log('PUT: ' + res);



    document.getElementById('infos').innerHTML = 'Localisation shared with succes';
    document.getElementById('infos').style.color = 'green';
}