async function checkLoginState() {
  const response = await fetch("/api/users/check-login", {
    credentials: "include",
  });

  const data = await response.json();

  if (data.loggedIn) {
    document.getElementById("loginBtn").classList.add("d-none");
    document.getElementById("signupBtn").classList.add("d-none");
    document.getElementById("logoutBtn").classList.remove("d-none");
    document.getElementById("myBtn").classList.remove("d-none");
  } else {
    document.getElementById("loginBtn").classList.remove("d-none");
    document.getElementById("signupBtn").classList.remove("d-none");
    document.getElementById("logoutBtn").classList.add("d-none");
    document.getElementById("myBtn").classList.add("d-none");
  }
}

document
  .getElementById("logoutBtn")
  .addEventListener("click", async function () {
    const confirmLogout = confirm("Are you sure to log out？");

    if (confirmLogout) {
      await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
      });
      checkLoginState();
      window.location.href = "/";
    }
  });

async function checkUserAndInitForm() {
  const urlParams = new URLSearchParams(window.location.search);
  const userID = urlParams.get("userId");

  if (!userID) {
    console.log(userID);
    alert("Invalid request. Redirecting to home...");
    window.location.href = "/";
    return;
  }

  try {
    const response = await fetch(`/api/users/book/${userID}`);

    const data = await response.json();
    console.log(data);

    if (!response.ok || !data.user) {
      console.log("User not found. Redirecting to home...");
      alert("User not found. Redirecting to home...");
      window.location.href = "/";
      return;
    }

    const appointmentTitle = document.querySelector("h2");
    appointmentTitle.innerHTML = `Make an appointment with <strong>${data.user.fullName}</strong>`;
  } catch (error) {
    console.error("Error checking user:", error);
    alert("An error occurred. Redirecting to home...");
    window.location.href = "/";
  }
}

document
  .getElementById("appointmentForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const userID = urlParams.get("userId");
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const comments = document.getElementById("comments").value;

    const response = await fetch(`/api/appointments/make/${userID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, date, time, comments }),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Appointment booked successfully!");
      window.location.href = "/";
    } else {
      alert(result.message || "Something went wrong!");
    }
  });
document.addEventListener("DOMContentLoaded", checkUserAndInitForm);

checkLoginState();
