const {app,BrowserWindow} = require('electron')
const path = require('path')
const {spawn} = require('child_process')

async function StartServer(){
    const server = spawn('node', [path.join(__dirname, 'server.js')])

    server.stdout.on('data',data=>{
        console.log(data.toString())
    })
    server.stderr.on('data',data=>{
        console.error(data.toString())
    })
    server.on('close',code=>{
        console.log('Server closed with code:',code)
    })
}
function StartApp(){
    const win = new BrowserWindow({
        width:800,
        height:600,
        resizable:false,
        frame:false,
        
    })
    win.loadFile('index.html')
}

app.on('ready',()=>{
    StartServer().then(StartApp)
    
})
app.on('window-all-closed',()=>{
    if(process.platform !== 'darwin'){
        app.quit()
    }
})
