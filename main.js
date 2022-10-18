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
var totalBalance;
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
    try{
      // console.log(data);
      ownerTokenBalance = data;
      $("#ideaObjectCount").text(`${ownerTokenBalance}`); //displays # of tokens in a paragraph element
      //only call indexOwnerTokens once the balance promise has been resolved
      indexOwnerTokens();
    }catch(e){
      console.log(e); // caught
    }

  });
  getSupplyPromise().then(data => {
    try{
      // console.log(data);
      totalBalance = data;
      $("#supply").text(`${totalBalance}`); //displays # of tokens in a paragraph element
      //only call indexOwnerTokens once the balance promise has been resolved
      indexAllTokens();
    }catch(e){
      console.log(e); // caught
    }

  });
}

async function getBalancePromise(){
  const balance = await contract.balanceOf(signer.getAddress());
  return balance;
}
async function getSupplyPromise(){
  const supply = await contract.totalSupply();
  return supply;
}
async function indexOwnerTokens(){  //index of all of the owner's tokens 
  for (let index = 0; index < ownerTokenBalance; index++) {
    //returns the token ID of the tokens in owner's wallet.
    const tokenID = await contract.tokenOfOwnerByIndex(signer.getAddress(),index);
    //using the token id, find the URI string of the token
    const URIString = await contract.tokenURI(tokenID)
    // console.log(await contract.ownerOf(index))
    //create a paragraph element and fill it with the text within the URI string
    var displayString = $("<p class='URIString'></p>").text(URIString);
    $("#listWrapper").append(displayString);
  }
}
async function indexAllTokens(){  //index all the tokens 
  console.log(totalBalance);
  for (let index = 0; index < totalBalance; index++) {
    //returns the token ID of all tokens in the world.
    const tokenID = await contract.tokenByIndex(index);
    //using the token id, find the URI string of the token
    const URIString = await contract.tokenURI(tokenID)
    const ownerAddress = await contract.ownerOf(index);
    console.log(await ownerAddress);
    //create a paragraph element and fill it with the text within the URI string
    // $("#listWrapper2").append("<div class='ideaWrapper'>");
    var displayString = $("<p class='URIString'></p>").text(URIString);
    $("#listWrapper2").append(displayString);
    var displayString2 = $("<p class='address'></p>").text(ownerAddress);
    $("#listWrapper2").append(displayString2);
    // $("#listWrapper2").append("</div>");
    // $( ".ideaWrapper" ).html(displayString);
    // $( ".ideaWrapper" ).append(displayString2);
  }
}