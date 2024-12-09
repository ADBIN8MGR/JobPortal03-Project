document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  document.getElementById("login-button").disabled = true;

  try {
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "same-origin",  // This ensures cookies are sent with the request
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("token", data.token);

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl; // Redirect based on role
      } else {
        alert("Redirection URL not provided.");
      }
    } else {
      alert(data.message || "Login failed.");
    }
  } catch (error) {
    console.error("Error during login:", error);
    alert("An error occurred.");
  } finally {
    document.getElementById("login-button").disabled = false;
  }
});
