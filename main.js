// MetaMask is our 'provider' in this case
const provider = new ethers.providers.Web3Provider(window.ethereum);

// You (whoever is signed into MetaMask) is the 'signer'
const signer = provider.getSigner();

// the 'contract' object allows us to call functions from our smart contract
const contract = new ethers.Contract(contractAddress, contractABI, provider);

// the 'contractWithSigner' object allows us to call smart contract functions that
// require us to send a transaction (like changing a number on the blockchain)
const contractWithSigner = contract.connect(signer);
var ownerTokenBalance;
async function init() {
  await provider.send("eth_requestAccounts", []);
  displayTokens();
}

init();

// EVENT LISTENERS

// when I click on the Mint button...
$('#mintIdea').click(function(){
  mintIdea();
})
$('#tokenList').click(function(){
  displayTokens();
})
// checks the blockchain for the current number every 2 seconds
// so that the page can be updated automatically if the number
// is changed.
// setInterval(function(){
//   displayTokens();
// }, 2000)

// FUNCTIONS


function mintIdea() {
  // grab the user input from the input text box
  const ideaObjectString = $('#ideaObjectString').val();

  // pass the string to the contract, along with the user's address.
  contractWithSigner.safeMint(signer.getAddress(),ideaObjectString);
}



function displayTokens(){  //load all user's tokens and display them as a list
  //first remove all previously displayed ideaObject strings
  $( ".URIString" ).remove();

  //asynchrously call getBalancePromise(). once promise is resolved, display the amount of ideaObjects the owner has
  getBalancePromise().then(data => {
    console.log(data);
    ownerTokenBalance = data;
    $("#ideaObjectCount").text(`${ownerTokenBalance}`); //displays # of tokens in a paragraph element
    //only call indexOwnerTokens once the balance promise has been resolved
    indexOwnerTokens();
  });

}

async function getBalancePromise(){
  const balance = await contract.balanceOf(signer.getAddress());
  return balance;
}

async function indexOwnerTokens(){  //index of all of the owner's tokens 
  for (let index = 0; index < ownerTokenBalance; index++) {
    //returns the token ID of the tokens in owner's wallet.
    const tokenID = await contract.tokenOfOwnerByIndex(signer.getAddress(),index);
    //using the token id, find the URI string of the token
    const URIString = await contract.tokenURI(tokenID)
    console.log(URIString)
    //create a paragraph element and fill it with the text within the URI string
    var displayString = $("<p class='URIString'></p>").text(URIString);
    $("#listWrapper").append(displayString);
  }
}