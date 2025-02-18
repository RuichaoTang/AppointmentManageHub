document
  .getElementById("loginForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("loging in");

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/api/users/loginUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    const errorMessage = document.getElementById("errorMessage");
    const successMessage = document.getElementById("successMessage");

    if (response.ok) {
      successMessage.textContent = "Login successful!";
      successMessage.classList.remove("d-none");
      errorMessage.classList.add("d-none");
      // Optionally store the token in localStorage or sessionStorage
      localStorage.setItem("token", result.token);
      window.location.href = "/manage.html";
    } else {
      errorMessage.textContent = result.message || "Invalid credentials!";
      errorMessage.classList.remove("d-none");
      successMessage.classList.add("d-none");
    }
  });

async function checkLoginState() {
  const response = await fetch("/api/users/check-login", {
    credentials: "include",
  });

  const data = await response.json();

  if (data.loggedIn) {
    document.getElementById("loginBtn").classList.add("d-none");
    document.getElementById("signupBtn").classList.add("d-none");
    document.getElementById("logoutBtn").classList.remove("d-none");
  } else {
    document.getElementById("loginBtn").classList.remove("d-none");
    document.getElementById("signupBtn").classList.remove("d-none");
    document.getElementById("logoutBtn").classList.add("d-none");
  }

  //only for sign-in/sign-up pages
  if (data.loggedIn) {
    window.location.href = "/";
  }
}
checkLoginState();
