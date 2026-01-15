document.addEventListener("DOMContentLoaded", () => {

  // ===== GLOBAL DEMO USER =====
  let demoUser = JSON.parse(localStorage.getItem("demoUser"));
  if (!demoUser) {
    demoUser = {
      fullName: "Charles Williams",
      email: "Charlesweahh@gmail.com",
      phone: "+1 510 367 1796",
      password: "2468000",
      emailNotif: true,
      smsNotif: false
    };
    localStorage.setItem("demoUser", JSON.stringify(demoUser));
  }

  // ===== INITIAL TRANSACTIONS =====
  let savedTransactions = JSON.parse(localStorage.getItem("transactions")) || [];
  if (!savedTransactions.length) {
    savedTransactions = [
      { type: "expense", text: "Netflix — Entertainment", amount: "$150", date: "2026-01-05" },
      { type: "income", text: "Salary — Deposit", amount: "$69000", date: "2026-01-09" }
    ];
    localStorage.setItem("transactions", JSON.stringify(savedTransactions));
  }

  // ===== TOTAL BALANCE =====
  const balanceEl = document.querySelector(".balance");
  let totalBalance = parseFloat(localStorage.getItem("totalBalance"));
  if (!totalBalance) totalBalance = balanceEl ? parseFloat(balanceEl.textContent.replace(/[$,]/g, "")) : 0;
  if (balanceEl) balanceEl.textContent = "$" + totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ===== LOGIN FORM =====
  const loginForm = document.getElementById("login-form");
  const messageEl = document.getElementById("login-message");
  if (loginForm) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value;

      if (!username || !password) {
        messageEl.style.color = "red";
        messageEl.textContent = "Please enter both username and password.";
        return;
      }

      messageEl.style.color = "blue";
      messageEl.textContent = "Checking credentials...";

      setTimeout(() => {
        if (username === demoUser.fullName && password === demoUser.password) {
          localStorage.setItem("loggedIn", "true");
          messageEl.style.color = "green";
          messageEl.textContent = "Login successful! Redirecting...";
          setTimeout(() => window.location.href = "dashboard.html", 500);
        } else {
          messageEl.style.color = "red";
          messageEl.textContent = "Invalid username or password.";
        }
      }, 500);
    });
  }

  // ===== AUTO REDIRECT IF LOGGED IN =====
  if (localStorage.getItem("loggedIn") && window.location.pathname.endsWith("index.html")) {
    window.location.href = "dashboard.html";
  }

  // ===== DASHBOARD ELEMENTS =====
  const sendForm = document.getElementById("send-money-form");
  const toggleTransferBtn = document.getElementById("toggle-transfer-btn");
  const transactionsList = document.querySelector(".transactions-card ul");

  // Render Transactions
  if (transactionsList) {
    transactionsList.innerHTML = "";
    savedTransactions.forEach(tx => {
      const li = document.createElement("li");
      li.classList.add(tx.type);
      li.innerHTML = `<span>${tx.text}</span><span>${tx.amount}</span>`;
      transactionsList.insertBefore(li, transactionsList.firstChild);
    });
  }

  // ===== CHART =====
  try {
    const spendingCanvas = document.getElementById("spendingChart");
    if (spendingCanvas) {
      const ctx = spendingCanvas.getContext("2d");
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      let monthlyExpenses = Array(12).fill(0);
      let monthlyIncome = Array(12).fill(0);

      savedTransactions.forEach(tx => {
        try {
          const txDate = tx.date ? new Date(tx.date) : new Date();
          const monthIndex = txDate.getMonth();
          const amountValue = parseFloat(tx.amount.replace(/[-$,]/g,""));
          if (tx.type === "expense" && !isNaN(amountValue)) monthlyExpenses[monthIndex] += amountValue;
          if (tx.type === "income" && !isNaN(amountValue)) monthlyIncome[monthIndex] += amountValue;
        } catch(e) { console.warn("Skipping invalid transaction:", tx); }
      });

      new Chart(ctx, {
        type: "bar",
        data: {
          labels: months,
          datasets: [
            { label: "Expenses", data: monthlyExpenses, backgroundColor: "rgba(217, 69, 69, 0.7)", borderRadius: 6 },
            { label: "Income", data: monthlyIncome, backgroundColor: "rgba(26, 154, 58, 0.7)", borderRadius: 6 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "top" }, tooltip: { mode: "index", intersect: false } },
          scales: { x: { stacked: false }, y: { stacked: false, beginAtZero: true, ticks: { callback: v => "$" + v.toLocaleString() } } }
        }
      });
    }
  } catch(e) { console.error("Chart error:", e); }

  // ===== LOGOUT =====
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedIn");
    window.location.href = "index.html";
  });

  // ===== PASSWORD CHANGE =====
  const passwordForm = document.getElementById("password-form");
  if (passwordForm) {
    const passwordMessage = document.getElementById("password-message");
    passwordForm.addEventListener("submit", e => {
      e.preventDefault();
      const current = document.getElementById("currentPassword").value;
      const newP = document.getElementById("newPassword").value;
      const confirmP = document.getElementById("confirmPassword").value;

      if (current !== demoUser.password) {
        passwordMessage.textContent = "Current password is incorrect!";
        passwordMessage.className = "error";
        return;
      }
      if (newP.length < 6) {
        passwordMessage.textContent = "New password must be at least 6 characters!";
        passwordMessage.className = "error";
        return;
      }
      if (newP !== confirmP) {
        passwordMessage.textContent = "New passwords do not match!";
        passwordMessage.className = "error";
        return;
      }

      demoUser.password = newP;
      localStorage.setItem("demoUser", JSON.stringify(demoUser));
      passwordMessage.textContent = "Password changed successfully ✔";
      passwordMessage.className = "success";

      passwordForm.reset();
    });
  }

  // ===== PROFILE PANEL TOGGLE =====
  const profileBtn = document.getElementById("profile-btn");
  const profilePanel = document.getElementById("profile-panel");
  const closeProfile = document.getElementById("close-profile");

  if (profileBtn && profilePanel) {
    profileBtn.addEventListener("click", () => {
      profilePanel.style.display = profilePanel.style.display === "block" ? "none" : "block";
    });
  }
  if (closeProfile) closeProfile.addEventListener("click", () => profilePanel.style.display = "none");

  // ===== SUCCESS MODAL =====
  const successModal = document.getElementById("success-modal");
  window.closeSuccess = () => {
    if (successModal) successModal.style.display = "none";
  };

  // ===== DOWNLOAD RECEIPT =====
  const downloadBtn = document.getElementById("download-receipt-btn");
  if (downloadBtn) {
    downloadBtn.onclick = () => {
      const receiptContent = document.getElementById("receipt").innerHTML;
      const blob = new Blob([receiptContent], { type: "text/html" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "receipt.html";
      link.click();
      URL.revokeObjectURL(link.href);
    };
  }

  // ===== QUICK BUTTONS & FORMS =====
  const quickBtns = document.querySelectorAll('.quick-btn');
  const payBillCard = document.querySelector('.pay-bill-card');
  const requestMoneyCard = document.querySelector('.request-money-card');

  if (payBillCard) payBillCard.style.display = 'none';
  if (requestMoneyCard) requestMoneyCard.style.display = 'none';

  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'pay-bill') {
        payBillCard.style.display = payBillCard.style.display === 'block' ? 'none' : 'block';
        requestMoneyCard.style.display = 'none';
      }
      if (action === 'request-money') {
        requestMoneyCard.style.display = requestMoneyCard.style.display === 'block' ? 'none' : 'block';
        payBillCard.style.display = 'none';
      }
      if (action === 'send-money') {
        sendForm.style.display = sendForm.style.display === 'block' ? 'none' : 'block';
        toggleTransferBtn.textContent = sendForm.style.display === 'block' ? "Hide Transfer Form" : "Transfer Funds";
        payBillCard.style.display = 'none';
        requestMoneyCard.style.display = 'none';
      }
    });
  });

  // ===== PAY BILL & REQUEST MONEY =====
  const payBillForm = document.getElementById("pay-bill-form");
  if (payBillForm) payBillForm.addEventListener("submit", e => {
    e.preventDefault();
    const biller = document.getElementById("biller").value.trim();
    const amount = parseFloat(document.getElementById("bill-amount").value);
    if (!biller || isNaN(amount) || amount <= 0 || amount > totalBalance) return;

    totalBalance -= amount;
    localStorage.setItem("totalBalance", totalBalance);
    balanceEl.textContent = "$" + totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const tx = { type: "expense", text: `Bill Payment — ${biller}`, amount: `-$${amount.toLocaleString()}`, date: new Date().toISOString().split("T")[0] };
    savedTransactions.unshift(tx);
    localStorage.setItem("transactions", JSON.stringify(savedTransactions));

    const li = document.createElement("li");
    li.className = "expense";
    li.innerHTML = `<span>${tx.text}</span><span>${tx.amount}</span>`;
    transactionsList.insertBefore(li, transactionsList.firstChild);

    payBillForm.reset();
  });

  const requestMoneyForm = document.getElementById("request-money-form");
  if (requestMoneyForm) requestMoneyForm.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("request-recipient").value.trim();
    const amount = parseFloat(document.getElementById("request-amount").value);
    if (!name || isNaN(amount) || amount <= 0) return;

    const tx = { type: "income", text: `Money Requested from ${name}`, amount: `$${amount.toLocaleString()}`, date: new Date().toISOString().split("T")[0] };
    savedTransactions.unshift(tx);
    localStorage.setItem("transactions", JSON.stringify(savedTransactions));

    const li = document.createElement("li");
    li.className = "income";
    li.innerHTML = `<span>${tx.text}</span><span>${tx.amount}</span>`;
    transactionsList.insertBefore(li, transactionsList.firstChild);

    requestMoneyForm.reset();
  });

});
