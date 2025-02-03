const express = require('express');
const path = require('path');
const multer = require('multer');
const {Pool,Client} = require('pg');
const {printer,types} = require('node-thermal-printer')
require('dotenv').config();



//criação do objeto que vai gerenciar as apis
const app = express();

//preparando o express para receber as informações de login
app.use(express.urlencoded({extended:true}));
//preparando o servidor para requisições fetch
app.use((req,res,next)=>{
	res.header('Access-Control-Allow-Origin','*');
	res.header('Access-Control-Allow-Methods','GET,POST');
	res.header('Access-Control-Allow-Headers','Content-Type');
	next();
})



//armazenamento de arquivos em buffer para enviar
const modoDeArmazenamento = multer.memoryStorage();
const upload = multer({storage:modoDeArmazenamento});
const tratalogin = multer();



//dados do banco ocultos por segurança
const dadosBd = {
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    port:process.env.DB_PORT,
    host:process.env.DB_HOST
}

//Criação do banco de dados
async function CriaBanco() {
    const cliente = new Client({
        user:dadosBd.user,
        password:dadosBd.password,
        host:dadosBd.host,
        port:dadosBd.port,
    });
    try{
        await cliente.connect();
        const consulta = await cliente.query('SELECT datname FROM pg_database');
        const result = consulta.rows.filter(bd=>bd.datname == dadosBd.database)
        if (result.length == 0)
            await cliente.query('CREATE DATABASE produtos;')
        await cliente.end();

    }catch(erro){
        console.error('Deu merda | ',erro)
    }
}
async function CriarTabela() {
    console.log("conectando ao banco de dados...");
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS produto(
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100),
                preco NUMERIC(5,2),
                codigo INTEGER
            );`)
            console.log("Banco conectado com sucesso");
    }catch(erro){
        console.error(erro);
    }
}



app.post('/cadastrar',tratalogin.none(),async (req,res)=>{
    try{
        const {produto,preco,codigo} = req.body
        await pool.query('INSERT INTO produto (nome,preco,codigo) VALUES($1,$2,$3);',
            [produto,preco,codigo])
        console.log('Produto cadastrado com sucesso')
    }catch(erro){
        console.error(erro)
    }
})

app.get('/listar',async(req,res)=>{
    try{
        const consulta = await pool.query('SELECT * FROM produto;')
        res.send(consulta)
    }catch(erro){
        console.error(erro)
    }
})


CriaBanco()
const pool = new Pool(dadosBd);
CriarTabela();
async function print() {
    const impressao = new printer({
        type:types.EPSON,
        interface: 'tcp://192.168.70.252',
        options:{
            timeout:5000
        }
        
    });

    impressao.alignCenter();
    impressao.println('qualquer coisa');
    impressao.cut();
    try{
        await impressao.execute()
        console.log('imprimido')
    }catch(erro){
        console.error(erro+"| | erro na impressão")
    }
}


app.listen(3000,'0.0.0.0',()=>{
    console.log('Conexão bem sucedida');
});