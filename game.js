let contractAddress = "0x45e620E0c91AF75e71ECBc6bf7a6c91592139038";
let Contract = new web3.eth.Contract(abi, contractAddress);

let amount; // amount the player chose
let checkedHigher; // whether higher option is checked
let playerAddress; // player's address
let rounds = 0;
const expectedBlockTime = 1000;

// You lost/won <amount> by guessing <dice> would be lower/higher
function formatResult({ playerWins, dice }, amount, checkedHigher) {
  let outcome = playerWins ? "won" : "lost";
  let option = checkedHigher ? "higher" : "lower";
  return `You ${outcome} ${amount} by guessing ${dice} would be ${option}`;
}

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

function handleError(error) {
  console.log("Something went wrong: ", error);
  $(".btn").prop("disabled", false);
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

  // disable button until transaction is completed
  $(".btn").prop("disabled", true);

  Contract.methods.winOrLose(checkedHigher).send(
    {
      from: playerAddress,
      gas: 3000000,
      value: web3.utils.toWei(amount, "ether"),
    },
    async function (error, transactionHash) {
      if (error) {
        handleError(error);
      } else if (transactionHash) {
        // This round is over, we got the transaction hash

        let transactionReceipt = null;
        while (transactionReceipt == null) {
          // Waiting until the transaction is mined.
          // The reason we wait is so we can get this round's result.
          // If we didn't wait, we would get the previous round result.
          transactionReceipt = await web3.eth.getTransactionReceipt(
            transactionHash
          );
          await sleep(expectedBlockTime);
        }

        // Now that the transaction is mined
        // we can call getLastRound to update history
        Contract.methods
          .getLastRound(playerAddress)
          .call(function (error, result) {
            if (error) {
              handleError(error);
            } else if (result) {
              let output = formatResult(result, amount, checkedHigher);
              let history = `Round ${rounds + 1} : ${output}\n`;
              document.getElementById("history").append(history);
              rounds++;
              $(".btn").prop("disabled", false);
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
