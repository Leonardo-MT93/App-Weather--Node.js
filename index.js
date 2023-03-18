require('dotenv').config()

const { leerInput, inquirerMenu, pausa, listarLugares } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");



const main = async()=> {
    const busquedas = new Busquedas();
    let opt;

    do{
        opt = await inquirerMenu();

        switch(opt) {

            case 1:
                //Mostrar mensaje para que la persona escriba
                const termino = await leerInput('Ingrese la ciudad que desea buscar: ');
                
                //Buscar los luagres
                const lugares = await busquedas.ciudad(termino);
                
                //Seleccionar el lugar
                const id = await listarLugares(lugares);
                const lugarSel = lugares.find(l => l.id === id);
                if(id === '0') continue;
                //Guardar en DB
                busquedas.agregarHistorial(lugarSel.nombre);
                //Datos del clima relacionados a la geolocalizacion
                const clima = await busquedas.climaLugar(lugarSel.lat, lugarSel.lng);
                //Mostar resultados
                console.clear()
                console.log('\nInformacion de la ciudad\n'.green);
                console.log('Ciudad:', lugarSel.nombre);
                console.log('Lat:', lugarSel.lat);
                console.log('Lng:', lugarSel.lng);
                console.log('Temperatura:', clima.temp);
                console.log('Mínima:', clima.min);
                console.log('Máxima:', clima.max);
                console.log('Como esta el clima:', clima.desc);

                // console.clear()
                
            break;
            case 2:

            //llamar al historial capitalizado
            busquedas.historialCapitalizado.forEach( (lugar, i) => {
                const idx = `${i+1 }`.green;
                console.log(`${idx} ${lugar}`);
            })


            break;
        }
        if(opt !== 0) await pausa();
       

        
    }while(opt !== 0)





}


main();