console.log(0.1+0.2)

let cart = [];
let products = [];  // Lista de produtos cadastrados
const cartItemsContainer = document.getElementById('cart-items');
const totalPriceContainer = document.getElementById('total-price');
const checkoutButton = document.getElementById('checkout');
const cancelPurchaseButton = document.getElementById('cancel-purchase');
const barcodeInput = document.getElementById('barcode-input');
const searchProductButton = document.getElementById('search-product');
const productListContainer = document.getElementById('product-list');
const productForm = document.getElementById('product-form');
const productNameInput = document.getElementById('product-name');
const productPriceInput = document.getElementById('product-price');
const productBarcodeInput = document.getElementById('product-barcode');
const trackingListContainer = document.getElementById('tracking-list');
const paymentForm = document.getElementById('payment-form');
const paymentMethodSelect = document.getElementById('payment-method');
const paymentAmountInput = document.getElementById('payment-amount');
const confirmPaymentButton = document.getElementById('confirm-payment');
const cancelPaymentButton = document.getElementById('cancel-payment');
const paymentMessageContainer = document.getElementById('payment-message');
const messageText = document.getElementById('message-text');
const quantidade = document.getElementById('quantidade');

let rep_alert = false;

document.getElementById('Close').addEventListener('click',()=>{
    window.close()
}) 

quantidade.addEventListener('change',()=>{if(quantidade.value<1){quantidade.value=1}})
let mensagem = localStorage.getItem('PGTO')
if(mensagem&&mensagem == 'Pagamento efetuado'){alertar('Mensagem','Pagamento efetuado com sucesso!')}
localStorage.removeItem('PGTO')

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

// Função para carregar os produtos cadastrados ao inicializar a página
async function loadProducts() {
        let consulta;
        try{
            consulta =  await fetch('http://localhost:3000/listar').then(resp=>resp.json())
            products = consulta.rows
            productListContainer.innerHTML = ''; // Limpar a lista de produtos antes de carregar
            products.forEach(product => {
                addProductToList(product); // Exibir cada produto na lista
            });
        }
        catch(err){ 
            alertar('Erro','Erro ao carregar produtos <br><br>'+err)
            console.error(err)
        }
}

// Função para cadastrar um novo produto


productForm.addEventListener('submit', async(e) => {
    e.preventDefault(); // Previne o envio padrão do formulário
    const url = new URL("http://localhost:3000/cadastrar");
    const name = productNameInput.value.trim();
    const price = parseFloat(productPriceInput.value);
    const barcode = productBarcodeInput.value.trim();

    // Verifica se os campos são válidos
    if (name && !isNaN(price) && barcode) {
         const newProduct = { id: products.length + 1, name, price, barcode };
        // products.push(newProduct); // Adiciona o produto à lista de produtos cadastrados
        // addProductToList(newProduct); // Exibir o novo produto na lista de produtos
        const formData = new FormData(productForm)
        await fetch(url,{method:'POST',body:formData}).then(
            console.log('Produto cadastrado')
        ).catch(err=>{
            console.log('erro')
            console.error(err)
        })
        

        productForm.reset(); // Limpar os campos do formulário
    } else {
        console.log('Por favor, preencha todos os campos corretamente.');
    }
});

// Função para adicionar produto à lista de produtos visível
function addProductToList(product) {
    const li = document.createElement('li');
    li.textContent = `${product.nome} - R$ ${product.preco} - Código: ${product.codigo}`;

    // Botão de adicionar ao carrinho
    const addButton = document.createElement('button');
    addButton.textContent = 'Adicionar ao Carrinho';
    addButton.onclick = () => addProductToCart(product.id, product.preco, product.nome);
    
    li.appendChild(addButton);
    productListContainer.appendChild(li);
}

// Função para adicionar item ao carrinho
function addProductToCart(productId, productPrice, productName) {

    const existingProduct = cart.find(item => item.id === productId);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        const product = { id: productId, price: productPrice, name: productName, quantity: 1 };
        cart.push(product);
    }

    updateCart();
}

// Função para atualizar o carrinho
function updateCart() {
    cartItemsContainer.innerHTML = '';
    trackingListContainer.innerHTML = ''; // Limpar a lista de acompanhamento

    let total = 0;

    cart.forEach((item, index) => {
        console.log(item)
        const li = document.createElement('li');
        li.textContent = `${item.name} - R$ ${item.price} x ${item.quantity}`;
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = "Cancelar";
        cancelButton.onclick = () => removeItemFromCart(index);
        
        li.appendChild(cancelButton);
        cartItemsContainer.appendChild(li);

        const trackingLi = document.createElement('li');
        trackingLi.textContent = `${item.name} - Quantidade: ${item.quantity}`;
        trackingListContainer.appendChild(trackingLi);

        total += item.price * item.quantity;
    });

    totalPriceContainer.textContent = total.toFixed(2);
}

// Função para remover item do carrinho
function removeItemFromCart(index) {
    cart.splice(index, 1); 
    updateCart();
}

// Função para cancelar a compra
cancelPurchaseButton.addEventListener('click', () => {
    alertar('Alerta','Tem certeza que deseja cancelar toda a compra?',true)
    document.querySelector('#darkscreen button:first-of-type').addEventListener('click',()=>{
        cart = [];
        updateCart();
        alertar('Mensagem','Compra cancelada com sucesso!')
    })

});

// Exibir formulário de pagamento ao finalizar compra
checkoutButton.addEventListener('click', () => {
    if (cart.length > 0) {
        paymentForm.style.display = 'block'; // Exibir o formulário de pagamento
        const totalAmount = parseFloat(totalPriceContainer.textContent);
        paymentAmountInput.setAttribute('max', totalAmount); // Limitar o valor máximo ao total da compra
    } else {
        console.log('Carrinho vazio! Adicione produtos para finalizar a compra.');
        alertar('Alerta','Carrinho vazio! Adicione produtos para finalizar a compra.')
    }
});

// Confirmar o pagamento
confirmPaymentButton.addEventListener('click',async (e) => {
    e.preventDefault()
    const paymentAmount = parseFloat(paymentAmountInput.value);
    const totalAmount = parseFloat(totalPriceContainer.textContent);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
        console.log('Por favor, insira um valor válido para o pagamento.');
        alertar('Alerta','Por favor, insira um valor válido para o pagamento.')
        return;
    }

    if (paymentAmount < totalAmount) {
        console.log('O valor pago é insuficiente. Tente novamente.');
        alertar('Alerta','O valor pago é insuficiente. Tente novamente.')
        
    } else {
        let items = document.querySelectorAll('#cart-items>li')
        let nota_fiscal = document.createElement('form')
        items.forEach(item=>{
            let texto_item =  item.textContent.replace("Cancelar","")
            nota_fiscal.insertAdjacentHTML('beforeend','<input type="text" name="itens[]" value="'+texto_item+'">')
        })
        nota_fiscal.insertAdjacentHTML('beforeend','<input type="text" name="total" value="Total: R$ '+totalAmount+'">')
        const change = paymentAmount - totalAmount;
        nota_fiscal.insertAdjacentHTML('beforeend','<input type="text" name="troco" value="Troco: R$ '+change+'">')

        const url = new URL("http://localhost:3000/pagar")
        const dados_nf = new FormData(nota_fiscal)
        try{
            fetch(url,{method:'POST',body:dados_nf})
            alertar('Mensagem','Pagamento recebido com sucesso! <br>Troco: R$ '+change.toFixed(2))
            cart = [];
            updateCart();
            paymentForm.style.display = 'none';
        }
        catch(err){
            console.error(err)
            alertar('Erro','Erro ao efetuar pagamento <br><br>'+err)
        }
        //
    
    }
});

// Cancelar o pagamento
cancelPaymentButton.addEventListener('click', () => {
    paymentForm.style.display = 'none'; // Esconder o formulário de pagamento
});

// Função para buscar produto por código de barras ou nome
barcodeInput.addEventListener('keyup',()=>escanear())



let escanear = () => {
    const searchQuery = barcodeInput.value.trim().toLowerCase(); // Obtém o valor da busca

    // Verifica se a busca está vazia
    if (searchQuery === '') {
        //console.log('Por favor, insira um código de barras ou nome do produto para buscar.');
        return;
    }

    // Filtra os produtos que correspondem ao código de barras ou nome (case insensitive)
    const filteredProducts = products.filter(product =>  
        product.codigo == searchQuery
    );

    if (filteredProducts.length > 0) {
        displaySearchResults(filteredProducts);
        barcodeInput.value=''
        for (let i = 0; i < quantidade.value; i++){
            addProductToCart(filteredProducts[0].id, filteredProducts[0].preco, filteredProducts[0].nome) // Exibe os produtos encontrados
        }
    }
};

// Função para exibir os resultados da busca
function displaySearchResults(filteredProducts) {
    // Limpa os resultados anteriores
    productListContainer.innerHTML = '';

    // Adiciona os produtos encontrados à lista
    filteredProducts.forEach(product => {
        addProductToList(product); // Reutiliza a função que já exibe os produtos
    });
}

// Carregar os produtos cadastrados quando a página for carregada
document.addEventListener('DOMContentLoaded', loadProducts);