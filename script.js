function login() {
  window.location.href = "dashboard.html";
}

function logout() {
  window.location.href = "index.html";
}

function sendMoney() {
  const recipient = document.getElementById("recipient").value;
  const amount = document.getElementById("amount").value;
  if(recipient && amount) {
    alert(`$${amount} sent to ${recipient}!`);
    document.getElementById("recipient").value = '';
    document.getElementById("amount").value = '';
  } else {
    alert("Please fill in all fields.");
  }
}

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // DEMO credentials (not real)
  const DEMO_USER = "John Williams";
  const DEMO_PASS = "password123";

  if (username === DEMO_USER && password === DEMO_PASS) {
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid username or password");
  }
}
