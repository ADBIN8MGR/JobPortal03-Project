// Handle login form submission
document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
  
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value; // Add role if needed
  
    // Send login request to backend
    const response = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, role }),
    });
  
    const data = await response.json();
  
    if (data.success) {
      // Store the JWT token in localStorage
      localStorage.setItem("token", data.token);
  
      // Redirect to the dashboard
      window.location.href = "/dashboard"; // After login, redirect to the dashboard
    } else {
      alert("Login failed: " + data.message); // Handle failed login
    }
  });
  