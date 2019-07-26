import Web3 from "web3"; //Importing Web3 object
import starNotaryArtifact from "../../build/contracts/StarNotary.json"; // Importing the JSON representation of the Smart Contract
import starNotaryV2Artifact from "../../build/contracts/StarNotaryV2.json";


const App = {
  web3: null,
  account: null,
  meta: null, //This object represent the Smart Contract for StarNotary v1
  meta2: null,  //This object represent the Smart Contract for StarNotary v2

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId(); //This method find the network id to retrieve the configuration from truffle-config.js file
      const deployedNetwork = starNotaryArtifact.networks[networkId]; // Retrieve the Network configuration from truffle-config.js file
      this.meta = new web3.eth.Contract( // Initializing the contract StarNotary v1
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );
      const deployedNetwork2 = starNotaryV2Artifact.networks[networkId];
      this.meta2 = new web3.eth.Contract( // Initializing the contract StarNotary v2
        starNotaryV2Artifact.abi,
        deployedNetwork2.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts(); // Getting test accounts
      this.account = accounts[0]; // Assigning a test account
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  // function to update the status message in the page
  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  // function to update the status message in the page for StarNotary v2
  setStatusV2: function(message) {
    const status = document.getElementById("statusV2");
    status.innerHTML = message;
  },

  // function called to show the starName
  starNameFunc: async function() {
    const { starName } = this.meta.methods; // to be able to use the functions in your Smart Contract use destructuring to get the function to be call
    const response = await starName().call(); // calling the starName property from your Smart Contract.
    const owner = document.getElementById("name"); // Updating Html
    owner.innerHTML = response;
  },

  // function called to show the starOwner
  starOwnerFunc: async function() {
    const { starOwner } = this.meta.methods; // to be able to use the functions in your Smart Contract use destructuring to get the function to be call
    const response = await starOwner().call(); // calling the starOwner property from your Smart Contract.
    const owner = document.getElementById("owner"); // Updating Html
    owner.innerHTML = response;
  },

  // function called to claim a Star
  claimStarFunc: async function(){
    const { claimStar, starOwner } = this.meta.methods; // to be able to use the functions in your Smart Contract use destructuring to get the function to be call
    await claimStar().send({from: this.account}); // Use `send` instead of `call` when you called a function in your Smart Contract
    const response = await starOwner().call();
    App.setStatus("New Star Owner is " + response + ".");
  },

  createStar: async function() {
    const { createStar } = this.meta2.methods;
    const name = document.getElementById("starName").value;
    const id = document.getElementById("starId").value;
    await createStar(name, id).send({from: this.account});
    App.setStatusV2("New Star Owner is " + this.account + ".");
  }

};

window.App = App;

window.addEventListener("load", async function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts from Metamask
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"),);
  }

  App.start();
});