let contractAddress = "0xc819aC19b4c2389Ea8204d3Bc388EE93C978c176";
let Contract = new web3.eth.Contract(abi, contractAddress);

let amount; // amount the player chose
let checkedHigher; // if higher option is checked, if not, the other one(lower) is checked
let playerAddress; // player's wallet adress
let rounds = 0;

// You lost/won <amount> by guessing <dice> would be lower/higher
function formatResult({ playerWins, dice }, amount, checkedHigher) {
  let outcome = playerWins ? "won" : "lost";
  let option = checkedHigher ? "higher" : "lower";
  return `You ${outcome} ${amount} by guessing ${dice} would be ${option}`;
}

function processForm(e) {
  if (e.preventDefault) e.preventDefault();
  amount = document.getElementById("amount").value;
  checkedHigher = document.getElementById("higher").checked;

  playerAddress = document.getElementById("address").value;
  if (web3.utils.isAddress(playerAddress) != true) {
    alert("Please give a valid address!");
    return false;
  }

  Contract.methods.winOrLose(checkedHigher).send(
    {
      from: playerAddress,
      gas: 3000000,
      value: web3.utils.toWei(amount, "ether"),
    },
    function (error, result) {
      if (error) {
        console.log("something went wrong", error);
      } else if (result) {
        Contract.methods
          .getLastRound(playerAddress)
          .call(function (error, result) {
            if (error) {
              console.log("something went wrong", error);
            } else if (result) {
              let output = formatResult(result, amount, checkedHigher);
              let history = `Round ${rounds + 1} : ${output}\n`;
              document.getElementById("history").append(history);
              rounds++;
            }
          });
      }
    }
  );
  // You must return false to prevent the default form behavior
  return false;
}

let form = document.getElementById("my-form");
if (form.attachEvent) {
  form.attachEvent("submit", processForm);
} else {
  form.addEventListener("submit", processForm);
}
