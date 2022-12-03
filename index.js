const express = require('express');
const app = express();
const port = process.env.PORT||3000;

//configuração de handlebars
const handlebars	= require('express-handlebars');
app.engine('handlebars', handlebars.engine('main'));
app.set('view engine','handlebars') ;
app.set('views','./view');
//arquivos estaticos
const path = require('path');
app.use(express.static(path.join(__dirname,'public')));
//caregando banco de dados
let contas// = require('./contas.json');
const fs = require('fs');
//configurando body-parser
const bodyPar = require('body-parser');
app.use(express.json({limit: '20mb'}));
app.use(express.urlencoded({ extended: false, limit: '20mb' }));
//express session
const session = require('express-session');
app.use(session({secret: 'ifodeApp'}));
fs.readFile('./data/contas.json','utf-8',(erro,data)=>{
        contas = JSON.parse(data);
       // console.log(data)
})


app.get('/',(req,res)=>{
        res.render("home",{conta:req.session.login});
        console.log(req.session.login)
})
app.get("/singin",(req,res)=>{
        res.render("singin",{contas:contas});
})
app.get("/login",(req,res)=>{
        res.render("login",{contas:contas});
})
app.get("/json",(req,res)=>{
        res.send(contas);
})
app.post("/login",(req,res)=>{
        for(conta of contas){
                if(conta.email == req.body.email){
                        if(conta.senha == req.body.password){
                           req.session.login = conta;
                           break;  
                        }
                }
        }
        res.render("certo");
})
app.post("/createCont",(req,res)=>{
        let createConta = {
                nome:req.body.name,
                email:req.body.email,
                senha:req.body.password,
               premium:req.body.premium,
        }
        req.session.login = createConta;
        contas.push(createConta);
        fs.writeFile('./data/contas.json',JSON.stringify(contas,null,2),()=>{
          console.log(createConta)
        })
           
        res.render("certo");
})


app.listen(port,console.log("aberto e funcionando "))