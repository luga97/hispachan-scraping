#!/usr/bin/env node

const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const argv = require("yargs").argv;

function setCharAt (str,index,chr) {
  if(index > str.length-1) return str;
  return str.substr(0,index) + chr + str.substr(index+1);
}

const pagina = new Promise((resolve, reject) => {
  let imagenes = [];
  const tablon = argv.tablon;
  const hilo = argv.hilo;
  const url = `https://www.hispachan.org/${tablon}/res/${hilo}.html`;

  request(url, (error, resp, body) => {
    if (!error && resp.statusCode === 200) {
      let $ = cheerio.load(body);

      $("img.thumb").each((i, el) => {
        let src = el.attribs.src;
        src = src.replace("thumb", "src");
        src = setCharAt(src, src.lastIndexOf("s"), "");
        imagenes.push(src);
      });
    }
    if (error) reject(error);
  });

  setTimeout(() => {
    resolve({
      imagenes,
      tablon,
      hilo
    });
  }, 5000);
});

pagina
  .then(respuesta => {
    console.log(respuesta);

    if(!fs.existsSync("img/")){
      fs.mkdirSync("img/");
      if (!fs.existsSync(`img/${respuesta.tablon}`)){
        fs.mkdirSync(`img/${respuesta.tablon}/`);
        if (!fs.existsSync(`img/${respuesta.tablon}/${respuesta.hilo}`)){
          fs.mkdirSync(`img/${respuesta.tablon}//${respuesta.hilo}`);
        }
      }
    }

    for(let i = 0; i < respuesta.imagenes.length; i++) {
      request(respuesta.imagenes[i]).pipe(fs.createWriteStream(`img/${respuesta.tablon}/${respuesta.hilo}/${i}.jpg`));
    }
  })
  .catch(respuesta => {
    console.error("Hubo un error al traer la pagina\n", respuesta);
  });
