function Cadastro(){

    let form = document.querySelector("form")
    form.addEventListener("submit",function(event){
        event.preventDefault()
        const nome = document.querySelector("#nome").value
        const codigo = document.querySelector("#codigo").value
        const preco = document.querySelector("#preco").value
        if(nome == "" || codigo == "" || preco == ""){
            alert("Preencha todos os campos!")
            form.reset()
        }else{
            if(/[^0-9]/.test(codigo)){
                alert("Código inválido!")
                form.reset()
            }else{
                const url = new URL("http://localhost:3000/cadastrar");
                const formData = new FormData(form)
                if(confirm(`
                    Nome: ${nome}
                    Código: ${codigo}
                    Preço: R$${preco}
                    Deseja cadastrar este produto?`)){
                    fetch(url,{method:'POST',body:formData}).then(
                        alert('Produto cadastrado')
                    ).catch(err=>{
                        alert('erro')
                        console.error(err)
                    })
                }
                form.reset()                
            }
        }
    })
}



document.addEventListener("DOMContentLoaded",Cadastro)