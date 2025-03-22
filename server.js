const express = require('express');
const path = require('path');
const multer = require('multer');
const {Pool,Client} = require('pg');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const fontkit = require('fontkit')
const { print } = require('pdf-to-printer');
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
    user:process.env.DB_USER||'postgres',
    password:process.env.DB_PASSWORD||'root',
    database:process.env.DB_NAME||'produtos',
    port:process.env.DB_PORT||5432,
    host:process.env.DB_HOST||'localhost'
}


    
const pool = new Pool(dadosBd);

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

function CorrigirValor(valor){
    let numeral = valor.split('.')
    numeral.forEach(num=>{num +=""})
    if(numeral[1].length == 1){
        numeral[1]+='0'
    }else if(numeral[1].length == 0){
        numeral[1]+='00'
    }else if(numeral[1].length>2){
        numeral[1] = numeral[1].slice(0,2)
    }
    let corrigido = numeral[0]+','+numeral[1]
    return corrigido;
}

async function Imprimir(itens,total,troco) {
    const pdfDoc = await PDFDocument.create();
    
    pdfDoc.registerFontkit(fontkit);
    const fontPath = path.join(__dirname,'Courier','courier-1.ttf');
    const fontBytes = fs.readFileSync(fontPath);
    const font = await pdfDoc.embedFont(fontBytes);

    const receiptContent = [
        'MERCADO DO ZÉ',
        '-----------------------------',
        '',
        'RECIBO DE COMPRA',
        ''
    ]
    itens.forEach(item=>{
        if(item.length>27){
            let palavras = item.split(' ');
            let linha1 = '';
            let linha2 = '';
            palavras.forEach(palavra=>{
                if(linha1.length<27){
                    linha1+=palavra+' ';
                }else{
                    linha2+=palavra+' ';
                }
            })
            receiptContent.push(linha1)
            receiptContent.push(linha2)
        }else{
            receiptContent.push(item)
        }
        receiptContent.push('-----------------------------')
    })
    receiptContent.push('')
    let total_corrigido = CorrigirValor(total.slice(10))
    total = 'TOTAL: R$ '+total_corrigido
    receiptContent.push(total)
    receiptContent.push('-----------------------------')
    let troco_corrigido = CorrigirValor(troco.slice(10))
    troco = 'TROCO: R$ '+troco_corrigido
    receiptContent.push(troco)
    const page = pdfDoc.addPage([230,22*receiptContent.length]);
    receiptContent.forEach((text,i)=>{
        page.drawText(text, {
            x: 10,
            y: (20*receiptContent.length)-(i*20),
            size: 12,
            font: font,
            color: rgb(0, 0, 0),
        });
    })
    
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(path.join(__dirname,'Novo_Recibo.pdf'),pdfBytes);
    //print(path.join(__dirname,'Novo_Recibo.pdf'));
}
   





app.post('/cadastrar',tratalogin.none(),async (req,res)=>{
    try{
        const {nome,preco,codigo} = req.body
        await pool.query('INSERT INTO produto (nome,preco,codigo) VALUES($1,$2,$3);',
            [nome,preco,codigo])
        console.log('Produto cadastrado com sucesso')
        res.send('Produto cadastrado com sucesso')
    }catch(erro){
        res.send('Erro ao cadastrar produto: '+erro)
        console.error(erro)
    }
})
app.get('/listar',async(req,res)=>{
    try{
        const consulta = await pool.query('SELECT * FROM produto;')
        
        res.send(consulta)
    }catch(erro){
        res.send('Erro ao listar produtos: '+erro)
        console.error(erro)
    }
})
app.post('/pagar',tratalogin.none(),(req,res)=>{
    const {itens,total,troco} = req.body;
    try{
        Imprimir(itens,total,troco);
        res.send('done')
    }catch(err){
        console.error(err)
        res.send("não deu")
    }
})


CriaBanco().then(()=>CriarTabela());



app.listen(3000,'0.0.0.0',async ()=>{
    console.log('Conexão bem sucedida');
});