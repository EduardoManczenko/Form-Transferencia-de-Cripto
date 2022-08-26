
let userWallet = document.getElementById('carteira')
let saldobnb = document.getElementById('saldobnb')
let userAddress = ''
let saldoTokens = document.getElementById('saldoTokens')
let nomeToken = document.getElementById('nomeToken')

//funcao de login com a metamask
async function loginMetamask(){
    let accounts = await ethereum.request({ method: 'eth_requestAccounts'}) //faz a requisição de login na metamask
    userAddress = accounts[0] // salva a carteira do usuario em uma variavel
    userWallet.innerHTML = userAddress // coloca a carteira do usuario no html
    getBnbBalance()
    getTokenBalance()
}

//funcao getProvider pega o providedr do usuario para poder fazer consultas como consulta de saldo e para poder pegar o signer para poder fazer transações de saldos na sua carteira
function getProvider(){
    if(!window.ethereum){
        console.log('Sem metamask instalada')
    }else{
        console.log('Acao em processo')
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);//faz a requisição do provider para poder consultar o saldo
    return provider
}

async function getBnbBalance(){
    const provider = getProvider() 
    const balance = await provider.getBalance(userAddress); // essa funcao pega o saldo da moeda nativa da carteira do usuario
    saldobnb.innerHTML = ethers.utils.formatEther(balance.toString()) //essa função formata o valor de wei para ethers
}

async function transferBNB(){
    const provider = await getProvider() //pegamos o provider que vai servir para pegar o signer para ter autorização em transacionar o saldo da carteira
    let toAddress = document.getElementById('toAddress').value //pegamos diretamente no campo de texto o endereço da carteira ao qual quer se enviado a transação
    let amount = document.getElementById('amount').value //pegamos diretamente do campo de texto o valor que o usuario deseja enviar
    ethers.utils.getAddress(toAddress) //essa função confere se o endereço da carteira que o usuario deseja enviar tokens esta correta

    const signer = provider.getSigner() // com o provider conseguimos pegar o signer que nos permite transacionar o saldo entre uma carteira e outra

    //a variavel abaixo é responsavel por realizar a rtansação, quando temos o signer precisamos especificar parametros para o envio
    const transaction = await signer.sendTransaction({
        to: toAddress,
        value: ethers.utils.parseEther(amount.toString())
    })
    console.log(transaction)
}

async function getTokenBalance(address = userAddress, contractAddress , decimals=18){
    const provider = getProvider() //pega o provider para poder consultar o saldo na blockchain
    contractAddress = document.getElementById('contrato').value //pega o endereço do contrato direto no campo de input
    const contract = new ethers.Contract(contractAddress, ["function balanceOf(address) view returns (uint)", "function name() public view virtual override returns (string memory)"], provider) // essa parte se cuminca diretamente com o smart contract criado, importando as funçoes presentes nele
    nomeToken.innerHTML = await contract.name() //aqui colocamos no campo de texto o nome do token consultado no contrato, usando uma função importada diratemente do smart contract
    const balance = await contract.balanceOf(address) //aqui pegamos o saldo de tokens da carteira usando uma função importada diretamente do smart contract
    saldoTokens.innerHTML = ethers.utils.formatUnits(balance.toString(), decimals) // aqui colocamos o saldo no campo de texto ja formatado de wei para ethereum
}

async function transferToken(toAddress, contractAddress, quantity, decimals = 18){
    toAddress = document.getElementById('toTokens').value // pega o endereço de para quem vai enviar no elemento html
    contractAddress = document.getElementById('contratoTransf').value // pega o contrato ao qual sera feita a transação no elemento html
    quantity = document.getElementById('amountTokens').value // pega a quantidade que vai ser transacionada no elemento html
    const provider = getProvider() // chama a função get provider
    const signer = provider.getSigner() // com o provider podemos pedir o signer do usuario para ter autorização de fazer transações com o saldo dele
    const contract = new ethers.Contract(contractAddress, ["function transfer(address to, uint amount)"], provider) // chamamos a funçao transfer importando ela diretamente do smart contract na blockchain, com os parametros do endereço do contrato a função chamada e o provider
    const contractSigner = contract.connect(signer) // conectamos no signer para poder fazer as transações
    const tx = await contractSigner.transfer(toAddress, ethers.utils.parseUnits(quantity, decimals)) // depois de coneectados no contrato como signer, nos podemos transacionar saldo da carteira do usuario com esse trecho de codigo chamando a função transfer importada do solidity
    console.log(tx)
}
