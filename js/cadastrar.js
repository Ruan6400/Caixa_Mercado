function Cadastro(){
    document.getElementById('Close').addEventListener('click',()=>{
        window.close()
    }) 
    let form = document.querySelector("form")
    form.addEventListener("submit",function(event){
        event.preventDefault()
        const nome = document.querySelector("#nome").value
        const codigo = document.querySelector("#codigo").value
        const preco = document.querySelector("#preco").value
        if(nome == "" || codigo == "" || preco == ""){
            alertar("Alerta","Preencha todos os campos!")
            document.querySelector('#darkscreen button:first-of-type').addEventListener('click',()=>{
                form.reset()
            })
        }else{
            if(/[^0-9]/.test(codigo)){
                alertar("Alerta","O código deve conter apenas números!")
                document.querySelector('#darkscreen button:first-of-type').addEventListener('click',()=>{
                form.reset()
            })
            }else{
                const url = new URL("http://localhost:3000/cadastrar");
                const formData = new FormData(form)
                alertar("Confirmação",`
                    Nome: ${nome}<br>
                    Código: ${codigo}<br>
                    Preço: R$${preco}<br>
                    Deseja cadastrar este produto?`,true)
                document.querySelector('#darkscreen button:first-of-type').addEventListener('click',()=>{
                    fetch(url,{method:'POST',body:formData}).then(
                        alertar("Mensagem","Produto cadastrado com sucesso!")
                    ).catch(err=>{
                        console.log('erro')
                        console.error(err)
                    })
                    form.reset()
                })
                form.reset()                
            }
        }
    })
}

function alertar(titulo="Alerta",mensagem,opcional=false){
    document.body.insertAdjacentHTML('beforeend',`
        <div id="darkscreen">
            <div>
                <h2>${titulo}</h2>
                <p>${mensagem}</p>
                <button>Ok</button>
                ${opcional?'<button>Cancelar</button>':''}
            </div>
        </div>
        `)
    document.querySelector('#darkscreen>div>button').addEventListener('click',()=>{
        document.getElementById('darkscreen').remove()
        rep_alert = true
    })
    if(opcional){document.querySelector('#darkscreen>div>button:nth-of-type(2)').addEventListener('click',()=>{
        document.getElementById('darkscreen').remove()
        rep_alert = false
    })}
    setTimeout(()=>{document.getElementById('darkscreen').style.opacity=1},100)
}



document.addEventListener("DOMContentLoaded",Cadastro)