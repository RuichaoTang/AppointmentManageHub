document
  .getElementById("registerForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    //   console.log(name, email, password);
    const response = await fetch("/api/users/registerUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const result = await response.json();

    const errorMessage = document.getElementById("errorMessage");
    const successMessage = document.getElementById("successMessage");

    if (response.ok) {
      successMessage.textContent =
        "Registration successful! You can now log in.";
      successMessage.classList.remove("d-none");
      errorMessage.classList.add("d-none");
      window.location.href = "/";
    } else {
      errorMessage.textContent = result.message || "Something went wrong!";
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
