document.addEventListener("DOMContentLoaded", () => {

  // ===== LOGIN HANDLER =====
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    const messageEl = document.getElementById("login-message");

    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const username = document.getElementById("username")?.value?.trim() || "";
      const password = document.getElementById("password")?.value || "";

      if (!username || !password) return alert("Please enter both username and password.");

      if (messageEl) {
        messageEl.style.color = "blue";
        messageEl.textContent = "Checking credentials...";
      }

      setTimeout(() => {
        if (username === "John Williams" && password === "Password123") {
          if (messageEl) {
            messageEl.style.color = "green";
            messageEl.textContent = "Login successful! Redirecting...";
          }
          setTimeout(() => window.location.href = "dashboard.html", 1000);
        } else {
          if (messageEl) {
            messageEl.style.color = "red";
            messageEl.textContent = "Invalid username or password.";
          }
          alert("Invalid username or password.");
        }
      }, 1500);
    });
  }

  // ===== DASHBOARD =====
  const sendForm = document.getElementById("send-money-form");
  const toggleTransferBtn = document.getElementById("toggle-transfer-btn");
  const balanceEl = document.querySelector(".balance");
  const transactionsList = document.querySelector(".transactions-card ul");

  // Balance
  let totalBalance = parseFloat(localStorage.getItem("totalBalance"));
  if (!totalBalance) {
    totalBalance = balanceEl ? parseFloat(balanceEl.textContent.replace(/[$,]/g, "")) : 0;
  }
  balanceEl.textContent = "$" + totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Transactions
  const savedTransactions = JSON.parse(localStorage.getItem("transactions")) || [];
  if (transactionsList) {
    savedTransactions.forEach(tx => {
      const li = document.createElement("li");
      li.classList.add(tx.type);
      li.innerHTML = `<span>${tx.text}</span><span>${tx.amount}</span>`;
      transactionsList.insertBefore(li, transactionsList.firstChild);
    });
  }

  // Toggle Transfer Form
  if (toggleTransferBtn && sendForm) {
    toggleTransferBtn.addEventListener("click", () => {
      if (sendForm.style.display === "none") {
        sendForm.style.display = "block";
        toggleTransferBtn.textContent = "Hide Transfer Form";
      } else {
        sendForm.style.display = "none";
        toggleTransferBtn.textContent = "Transfer Funds";
      }
    });
  }

  // ===== PIN MODAL =====
  const pinModal = document.createElement("div");
  pinModal.id = "pinModal";
  pinModal.style.cssText = `
    display:none; position:fixed; top:0; left:0; width:100%; height:100%;
    background:rgba(0,0,0,0.5); z-index:1000; justify-content:center; align-items:center; font-family:Arial,sans-serif;
  `;
  pinModal.innerHTML = `
    <div style="background:#fff;padding:25px 30px;border-radius:15px;width:320px;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,0.2);">
      <h3 style="margin-bottom:15px;color:#333;">Enter Transfer PIN</h3>
      <p style="color:#666;font-size:14px;margin-bottom:15px;">For security, enter your 4-digit transfer PIN.</p>
      <input type="password" id="transferPin" placeholder="••••" style="width:80%;padding:10px;font-size:16px;border-radius:8px;border:1px solid #ccc;text-align:center;letter-spacing:5px;">
      <div style="margin-top:20px;">
        <button id="confirmPinBtn" style="padding:8px 20px;background:#007bff;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;">Confirm</button>
        <button id="cancelPinBtn" style="padding:8px 20px;background:#ccc;color:#333;border:none;border-radius:8px;cursor:pointer;font-size:14px;margin-left:10px;">Cancel</button>
      </div>
      <div id="pinMessage" style="color:red;margin-top:10px;font-size:13px;"></div>
    </div>
  `;
  document.body.appendChild(pinModal);

  const pinInput = document.getElementById("transferPin");
  const pinMessage = document.getElementById("pinMessage");
  const confirmBtn = document.getElementById("confirmPinBtn");
  const cancelBtn = document.getElementById("cancelPinBtn");
  const correctPin = "2027";

  cancelBtn.onclick = () => pinModal.style.display = "none";

  // Send Money Submission
  if (sendForm && balanceEl && transactionsList) {
    const amountInput = document.getElementById("amount");
    const recipientInput = document.getElementById("recipient");
    const bankSelect = document.getElementById("bank");
    const noteInput = document.getElementById("note");
    const sendBtn = document.getElementById("send-btn");
    const maxAttempts = 3;

    sendForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const amount = parseFloat(amountInput.value);
      const recipient = recipientInput.value.trim();
      const bank = bankSelect.value;
      const note = noteInput.value.trim();

      if (!bank || !recipient || isNaN(amount) || amount <= 0) return alert("Fill all fields correctly.");
      if (amount > totalBalance) return alert("Insufficient funds.");

      // Show PIN modal
      pinModal.style.display = "flex";
      pinInput.value = "";
      pinMessage.textContent = "";
      pinInput.focus();
      let attemptsLeft = maxAttempts;

      confirmBtn.onclick = () => {
        const enteredPin = pinInput.value.trim();
        if (enteredPin !== correctPin) {
          attemptsLeft--;
          if (attemptsLeft > 0) {
            pinMessage.textContent = `Incorrect PIN. ${attemptsLeft} attempt(s) remaining.`;
            pinInput.value = "";
            pinInput.focus();
          } else {
            pinMessage.textContent = "Maximum attempts reached. Try again later.";
            setTimeout(() => pinModal.style.display = "none", 1000);
          }
          return;
        }

        // Correct PIN
        pinModal.style.display = "none";
        sendBtn.disabled = true;
        const originalText = sendBtn.textContent;
        let dots = 0;
        sendBtn.textContent = "Processing";
        const loader = setInterval(() => {
          dots = (dots + 1) % 4;
          sendBtn.textContent = "Processing" + ".".repeat(dots);
        }, 400);

        setTimeout(() => {
          clearInterval(loader);
          totalBalance -= amount;
          balanceEl.textContent = "$" + totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

          const li = document.createElement("li");
          li.classList.add("expense");
          li.innerHTML = `<span>Transfer to ${recipient} (${bank})${note ? " — " + note : ""}</span><span>-$${amount.toLocaleString()}</span>`;
          transactionsList.insertBefore(li, transactionsList.firstChild);

          savedTransactions.unshift({
            type: "expense",
            text: `Transfer to ${recipient} (${bank})${note ? " — " + note : ""}`,
            amount: "-$" + amount.toLocaleString()
          });

          localStorage.setItem("totalBalance", totalBalance);
          localStorage.setItem("transactions", JSON.stringify(savedTransactions));

          alert(`Transfer of $${amount.toLocaleString()} to ${recipient}${note ? " — " + note : ""} successful ✔`);
          sendForm.reset();
          sendBtn.disabled = false;
          sendBtn.textContent = originalText;
        }, 2000);
      };
    });
  }

  // ===== LOGOUT =====
  const logoutBtn = document.getElementById("logout-btn");
  logoutBtn && logoutBtn.addEventListener("click", () => window.location.href = "index.html");

  // ===== BALANCE TOGGLE =====
  const balanceToggleBtn = document.getElementById("toggle-balance");
  const sensitiveBalances = document.querySelectorAll(".sensitive");
  let visible = true;
  const originalValues = [];
  sensitiveBalances.forEach(el => originalValues.push(el.textContent));

  balanceToggleBtn && balanceToggleBtn.addEventListener("click", () => {
    sensitiveBalances.forEach((el, index) => {
      if (visible) {
        el.textContent = "••••••";
        el.classList.add("hidden");
      } else {
        el.textContent = originalValues[index];
        el.classList.remove("hidden");
      }
    });
    balanceToggleBtn.textContent = visible ? "👁‍🗨" : "👁";
    visible = !visible;
  });

  // ===== PROFILE PANEL =====
  const profileBtn = document.getElementById("profile-btn");
  const profilePanel = document.getElementById("profile-panel");
  const closeProfileBtn = document.getElementById("close-profile");

  if (profileBtn && profilePanel && closeProfileBtn) {
    // Toggle panel
    profileBtn.addEventListener("click", () => {
      profilePanel.style.display = profilePanel.style.display === "block" ? "none" : "block";
    });

    // Close button inside panel
    closeProfileBtn.addEventListener("click", () => {
      profilePanel.style.display = "none";
    });

    // Click outside to close
    document.addEventListener("click", (e) => {
      if (
        profilePanel.style.display === "block" &&
        !profilePanel.contains(e.target) &&
        !profileBtn.contains(e.target)
      ) {
        profilePanel.style.display = "none";
      }
    });
  }

});
