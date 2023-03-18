const fs = require('fs');
const axios = require('axios');


class Busquedas {
    historial = [];
    dbPath = './db/database.json';
    constructor(){
        //TODO: leer DB si existe
        this.leerDB();
    }

    get historialCapitalizado(){
        return this.historial.map( lugar => {
            let palabras = lugar.split(' ');
            palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1));
            return palabras.join(' ');
        })
    }
    //CREAMOS UN GETTER PARA SIMPLIFAR LA LLAMADA A TODOS LOS PARAMETROS DE MAPBOX
    get paramsMapbox(){
        return {
                'access_token': process.env.MAPBOX_KEY,
                'limit': 5,
                'languaje': 'es'
    }
    }
    get paramsWeather(){
        return {
            appid: process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'es'
        }
    }
    //metodo para buscar si existe alguna ciudad. peticion asincrona
    async ciudad(lugar =''){
        //peticion http
        const instance = axios.create({
            baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
            params: this.paramsMapbox
        })
        const resp = await instance.get();
        return resp.data.features.map(lugar => ({
            id: lugar.id,
            nombre: lugar.place_name,
            lat: lugar.center[1],
            lng: lugar.center[0],
        }));

    }
    async climaLugar(lat, lon){
        try {
            //Creamos la instancia de axios.create
        const instance = axios.create({
            baseURL: `https://api.openweathermap.org/data/2.5/weather?}`,
            params: {
                ...this.paramsWeather, lat, lon
            }
        })    
            //Con la respuesta extraemos la informacion que esta en la data
        const resp = await instance.get();
        const {weather, main} = resp.data;

            //Retornamos un objeto con la descripcion.. las nubes estan claras por ej.., la temp minima, la temp maxima, y la temperatura normal
            return {
                desc:weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            };
        } catch (error) {
            console.log(error)
        }
    }

    agregarHistorial(lugar=''){
        //Prevenir los duplicados
        if(this.historial.includes(lugar.toLowerCase())){
            return;
        }
        this.historial = this.historial.splice(0,4);
        this.historial.unshift(lugar.toLowerCase());
        //grabar en DB
        this.guardarDB();

    }
    guardarDB(){
        const payload = {
            historial: this.historial
        };
        fs.writeFileSync(this.dbPath, JSON.stringify(payload))
    }
    leerDB(){
        //verificar que exista 
        if(!fs.existsSync(this.dbPath)){
            return null;
        }
        //cargar la info en una constante readfilesync path enconding utf-8
        const info = fs.readFileSync(this.dbPath, {encoding: 'utf-8'});

        const data = JSON.parse(info); //Se obtiene un objeto
        this.historial = data.historial;
        
        
    }
}


module.exports = Busquedas;