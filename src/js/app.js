//import "../css/style.css"

const Web3 = require('web3');
const contract = require('@truffle/contract');

const votingArtifacts = require('../../build/contracts/Voting.json');
var VotingContract = contract(votingArtifacts);

// Utility function to show notifications
function showNotification(message, type = 'info') {
  const container = document.getElementById('notificationContainer') || document.body;
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  container.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Add slideOutRight animation if not exists
if (!document.getElementById('notificationStyles')) {
  const style = document.createElement('style');
  style.id = 'notificationStyles';
  style.textContent = `
    @keyframes slideOutRight {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(100px);
      }
    }
  `;
  document.head.appendChild(style);
}

// Show loading indicator
function showLoading(show = true) {
  const loadingIndicator = document.getElementById('loadingIndicator');
  const candidateContainer = document.getElementById('candidate');
  
  if (loadingIndicator) {
    loadingIndicator.style.display = show ? 'block' : 'none';
  }
  if (candidateContainer) {
    candidateContainer.style.display = show ? 'none' : 'block';
  }
}

// Format account address
function formatAddress(address) {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

window.App = {
  eventStart: async function() { 
    showLoading(true);
    
    try {
      // Request MetaMask account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      if (!account) {
        showLoading(false);
        showNotification("Please connect MetaMask to continue!", 'error');
        return;
      }

      // Initialize Web3 and contract
      window.eth = new Web3(window.ethereum);
      VotingContract.setProvider(window.ethereum);
      VotingContract.defaults({ from: account, gas: 6654755 });

      // Display connected account
      App.account = account;
      const accountElement = document.getElementById('accountAddress');
      if (accountElement) {
        accountElement.textContent = `Connected: ${formatAddress(account)}`;
      }

      // Load contract data
      VotingContract.deployed().then(function(instance) {
        App.instance = instance;
        
        instance.getCountCandidates().then(function(countCandidates) {
          if (countCandidates === 0) {
            showLoading(false);
            showNotification("No candidates available yet.", 'error');
            return;
          }

          // Display all candidates
          const candidatePromises = [];
          for (let i = 0; i < countCandidates; i++) {
            candidatePromises.push(
              instance.getCandidate(i + 1).then(function(data) {
                const id = data[0];
                const name = data[1];
                const party = data[2];
                const voteCount = data[3];
                
                const row = document.createElement('tr');
                row.innerHTML = `
                  <td>
                    <input class="form-check-input" type="radio" name="candidate" value="${id}" id="candidate-${id}">
                    <label for="candidate-${id}" style="margin-left: 8px; cursor: pointer;">${name}</label>
                  </td>
                  <td>${party}</td>
                  <td><span class="vote-count">${voteCount}</span></td>
                `;
                
                // Add click handler for row selection
                row.addEventListener('click', function(e) {
                  if (e.target.type !== 'radio') {
                    const radio = row.querySelector('input[type="radio"]');
                    if (radio) {
                      radio.checked = true;
                      radio.dispatchEvent(new Event('change'));
                    }
                  }
                });
                
                // Add change handler for radio
                const radio = row.querySelector('input[type="radio"]');
                if (radio) {
                  radio.addEventListener('change', function() {
                    document.querySelectorAll('tbody tr').forEach(r => r.classList.remove('selected'));
                    if (this.checked) {
                      row.classList.add('selected');
                    }
                  });
                }
                
                const tbody = document.getElementById('boxCandidate');
                if (tbody) {
                  tbody.appendChild(row);
                }
              })
            );
          }

          Promise.all(candidatePromises).then(() => {
            showLoading(false);
            showNotification("Candidates loaded successfully!", 'success');
          });

          window.countCandidates = countCandidates;
        }).catch(function(err) {
          showLoading(false);
          console.error("Error getting candidates:", err);
          showNotification("Error loading candidates", 'error');
        });

        // Display current voting dates
        instance.getDates().then(function(result) {
          const startDate = new Date(result[0] * 1000);
          const endDate = new Date(result[1] * 1000);
          const datesElement = document.getElementById('dates');
          
          if (datesElement && result[0] > 0) {
            datesElement.textContent = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
          } else if (datesElement) {
            datesElement.textContent = "Not set";
          }
        }).catch(function(err) {
          console.error("Error getting dates:", err);
        });

        // Check if user has already voted
        instance.checkVote().then(function(voted) {
          const voteButton = document.getElementById('voteButton');
          if (voteButton) {
            if (voted) {
              voteButton.disabled = true;
              voteButton.textContent = 'Already Voted';
              showNotification("You have already voted.", 'info');
            } else {
              voteButton.disabled = false;
            }
          }
        }).catch(function(err) {
          console.error("Error checking vote status:", err);
        });

        // Setup admin functions if on admin page
        if (document.getElementById('addCandidate')) {
          $('#addCandidate').off('click').on('click', async function() {
            const nameCandidate = $('#name').val().trim();
            const partyCandidate = $('#party').val().trim();

            if (!nameCandidate || !partyCandidate) {
              showNotification("Please enter both name and party!", 'error');
              return;
            }

            const button = this;
            const originalText = button.value;
            button.disabled = true;
            button.value = 'Adding...';

            try {
              const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
              const account = accounts[0];

              await instance.addCandidate(nameCandidate, partyCandidate, { from: account })
                .then(() => {
                  showNotification("Candidate added successfully!", 'success');
                  $('#name').val('');
                  $('#party').val('');
                  button.disabled = false;
                  button.value = originalText;
                })
                .catch(err => {
                  console.error("Error adding candidate:", err);
                  showNotification("Error adding candidate: " + err.message, 'error');
                  button.disabled = false;
                  button.value = originalText;
                });
            } catch (err) {
              showNotification("Error: " + err.message, 'error');
              button.disabled = false;
              button.value = originalText;
            }
          });

          $('#addDate').off('click').on('click', async function() {
            const startDate = Date.parse(document.getElementById("startDate").value) / 1000;
            const endDate = Date.parse(document.getElementById("endDate").value) / 1000;

            if (!startDate || !endDate) {
              showNotification("Please select both start and end dates!", 'error');
              return;
            }

            if (endDate <= startDate) {
              showNotification("End date must be after start date!", 'error');
              return;
            }

            const button = this;
            const originalText = button.value;
            button.disabled = true;
            button.value = 'Setting...';

            try {
              const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
              const account = accounts[0];

              await instance.setDates(startDate, endDate, { from: account })
                .then(() => {
                  showNotification("Voting dates set successfully!", 'success');
                  button.disabled = false;
                  button.value = originalText;
                })
                .catch(err => {
                  console.error("Error setting dates:", err);
                  showNotification("Error setting dates: " + err.message, 'error');
                  button.disabled = false;
                  button.value = originalText;
                });
            } catch (err) {
              showNotification("Error: " + err.message, 'error');
              button.disabled = false;
              button.value = originalText;
            }
          });
        }

      }).catch(function(err) {
        showLoading(false);
        console.error("Error deploying contract:", err);
        showNotification("Error connecting to contract", 'error');
      });
    } catch (err) {
      showLoading(false);
      console.error("Error in eventStart:", err);
      showNotification("Error initializing: " + err.message, 'error');
    }
  },

  // Voting Function
  vote: async function() {    
    const candidateID = $("input[name='candidate']:checked").val();
    if (!candidateID) {
      showNotification("Please select a candidate first!", 'error');
      const msgElement = document.getElementById('msg');
      if (msgElement) {
        msgElement.innerHTML = '<p class="error">Please select a candidate.</p>';
        msgElement.className = 'error';
      }
      return;
    }

    const voteButton = document.getElementById('voteButton');
    if (voteButton) {
      voteButton.disabled = true;
      const buttonText = voteButton.querySelector('.button-text') || voteButton;
      buttonText.innerHTML = '<span class="loading-spinner"></span>Processing vote...';
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      VotingContract.deployed().then(async function(instance) {
        await instance.vote(parseInt(candidateID), { from: account })
          .then(function(result) {
            showNotification("Vote cast successfully! Thank you for voting.", 'success');
            
            const msgElement = document.getElementById('msg');
            if (msgElement) {
              msgElement.innerHTML = '<p class="success">Voted Successfully!</p>';
              msgElement.className = 'success';
            }

            if (voteButton) {
              voteButton.disabled = true;
              const buttonText = voteButton.querySelector('.button-text') || voteButton;
              buttonText.textContent = 'Vote Cast';
            }

            // Reload after a short delay
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          })
          .catch(err => {
            console.error("Voting error:", err);
            showNotification("Error casting vote: " + err.message, 'error');
            
            if (voteButton) {
              voteButton.disabled = false;
              const buttonText = voteButton.querySelector('.button-text') || voteButton;
              buttonText.textContent = 'Cast Vote';
            }
          });
      }).catch(function(err) {
        console.error("Contract deployment error:", err);
        showNotification("Error connecting to contract", 'error');
        
        if (voteButton) {
          voteButton.disabled = false;
          const buttonText = voteButton.querySelector('.button-text') || voteButton;
          buttonText.textContent = 'Cast Vote';
        }
      });
    } catch (err) {
      console.error("Error in vote function:", err);
      showNotification("Error: " + err.message, 'error');
      
      if (voteButton) {
        voteButton.disabled = false;
        const buttonText = voteButton.querySelector('.button-text') || voteButton;
        buttonText.textContent = 'Cast Vote';
      }
    }
  }
};

// Initialize App on window load
window.addEventListener('load', async () => {
  if (typeof window.ethereum !== 'undefined') {
    console.log("🦊 MetaMask detected!");
    window.web3 = new Web3(window.ethereum);
    App.web3Provider = window.ethereum;

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await window.web3.eth.getAccounts();
      App.account = accounts[0];
      console.log("Connected account:", App.account);
      
      const accountElement = document.getElementById('accountAddress');
      if (accountElement) {
        accountElement.textContent = `Connected: ${formatAddress(App.account)}`;
      }

      // Initialize contract
      VotingContract.setProvider(window.ethereum);
      VotingContract.defaults({ from: App.account, gas: 6721975 });

      App.instance = await VotingContract.deployed();
      console.log("✅ Contract loaded at:", App.instance.address);

      // Start main event logic
      if (App.eventStart) {
        App.eventStart();
      }
    } catch (error) {
      console.error("❌ User denied MetaMask connection or other error:", error);
      showNotification("Please connect MetaMask to continue", 'error');
      showLoading(false);
    }

  } else {
    console.warn("⚠️ MetaMask not found! Falling back to local Ganache RPC...");
    App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
    window.web3 = new Web3(App.web3Provider);
    VotingContract.setProvider(App.web3Provider);

    try {
      App.instance = await VotingContract.deployed();
      console.log("✅ Connected to local Ganache instance:", App.instance.address);

      if (App.eventStart) {
        App.eventStart();
      }
    } catch (error) {
      console.error("Error connecting to Ganache:", error);
      showNotification("Error connecting to blockchain", 'error');
      showLoading(false);
    }
  }
});
