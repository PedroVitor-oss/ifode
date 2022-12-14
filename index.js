const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

//carregar models 
const multer = require('./models/multer.js')
//carregar componentes
const header = require('./components/header.js')
const rodape = require('./components/rodape.js')
//configuração de handlebars
const handlebars = require('express-handlebars');
app.engine('handlebars', handlebars.engine('main'));
app.set('view engine', 'handlebars');
app.set('views', './view');
//arquivos estaticos
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
//configurando body-parser
const bodyPar = require('body-parser');
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: false, limit: '20mb' }));
//express session
const session = require('express-session');
app.use(session({ secret: 'ifodeApp' }));
//caregando banco de dados
const fs = require('fs');
let contas;
fs.readFile('./data/contas.json', 'utf-8', (erro, data) => {
        contas = JSON.parse(data);
})
let iFoders;
fs.readFile('./data/ifoders.json', 'utf-8', (erro, data) => {
        iFoders = JSON.parse(data);

})

app.get('/', (req, res) => {
        res.render("home", {
                conta: req.session.login,
                header:header,
                rodape:rodape
        });

})
app.get("/singin", (req, res) => {
        res.render("singin", {
                contas: contas
        });
})
app.get("/login", (req, res) => {
        res.render("login", {
                contas: contas
        });
})
app.post("/login", (req, res) => {
        for (conta of contas) {
                if (conta.email == req.body.email) {
                        if (conta.senha == req.body.password) {
                                req.session.login = conta;
                                break;
                        }
                }
        }
        res.render("certo");
})
app.post("/createCont", (req, res) => {
        let createConta = {
                nome: req.body.name,
                email: req.body.email,
                senha: req.body.password,
                premium: req.body.premium,
        }
        req.session.login = createConta;
        contas.push(createConta);
        fs.writeFile('./data/contas.json', JSON.stringify(contas, null, 2), () => {
                console.log(createConta)
        })

        res.render("certo");
})
app.get("/tags/:name", (req, res) => {
        if (req.params.name == "solteiras") {
                res.render("list", {
                        nameTag: req.params.name,
                        tagActive: 0,
                        datas: iFoders.soilteiras,
                        conta: req.session.login,
                        header:header,
                        rodape:rodape
                })
        } else if (req.params.name == "casadas") {
                res.render("list", { 
                        nameTag: req.params.name, 
                        tagActive: 1, 
                        datas: iFoders.casadas, 
                        conta: req.session.login ,
                        header:header,
                        rodape:rodape
                })
        } else if (req.params.name == "pornStars") {
                res.render("list", { 
                        nameTag: req.params.name, 
                        tagActive: 2,
                        datas: iFoders.pornSatrs,
                        conta: req.session.login,
                        header:header,
                        rodape:rodape
                        })
        } else {
                res.render("erro404");
        }
})
app.get("/adm/cadastreIFoder", (req, res) => {
        res.render("cadastre_i_foder");
})
app.post("/addIfoder", multer.single('img'), (req, res) => {
        if (req.file) {
                let newIfoder = {
                        nome: req.body.name,
                        idade: req.body.idade,
                        img:req.file.originalname,
                        cidade: req.body.local,
                        map: req.body.map,
                        descricao: req.body.descricao
                }
                let type = (req.body.type);
                if (type == "solteira") {
                        iFoders.soilteiras.push(newIfoder);
                } else if (type == "casada") {
                        iFoders.casadas.push(newIfoder);
                } else if (type == "pornStar") {
                        iFoders.pornSatrs.push(newIfoder);
                }
             
                fs.writeFile('./data/ifoders.json', JSON.stringify(iFoders, null, 2), () => {
                        console.log("novo iFoder cadastrado");
                })
                res.render("certo");
        }else{
                res.send("o correu um erro ");
        }
})
app.get("/iFoder/:type/:name", (req, res) => {
        let perfil = undefined;
        let type = req.params.type;
        if (type == "solteiras") {
                for (ifoder of iFoders.soilteiras) {
                        if (ifoder.nome == req.params.name) {
                                perfil = ifoder;
                        }
                }
        } else if (type == "casadas") {
                for (ifoder of iFoders.casadas) {
                        if (ifoder.nome == req.params.name) {
                                perfil = ifoder;
                        }
                }
        } else if (type == "pornStars") {
                for (ifoder of iFoders.pornSatrs) {
                        if (ifoder.nome == req.params.name) {
                                perfil = ifoder;
                        }
                }
        }
        if (perfil != undefined) {
                res.render("perfilIfoder", {
                        conta: req.session.login,
                        tagName: req.params.type,
                        perfil: perfil,
                        header:header,
                        rodape:rodape
                });
              
        } else {
                res.render("erro404");
        }
})
app.get("/json1", (req, res) => {
        res.send(contas);
})
app.get("/json2", (req, res) => {
        res.send(iFoders);
})
app.use(function (req, res, next) {
        res.status(404).render("erro404");
});

app.listen(port, console.log("aberto e funcionando "))