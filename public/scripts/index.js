document.getElementById("searchBtn").addEventListener("click", function () {
  console.log("searching...");
  const searchQuery = document.getElementById("searchInput").value.trim();

  if (!searchQuery) {
    alert("Please enter users name.");
    return;
  }

  fetch(`/api/users/search-users?name=${encodeURIComponent(searchQuery)}`)
    .then((res) => res.json())
    .then((data) => {
      const resultsContainer = document.getElementById("searchResults");
      resultsContainer.innerHTML = ""; // 清空旧搜索结果

      if (data.length === 0) {
        resultsContainer.innerHTML =
          "<p class='text-center text-muted'>No results.</p>";
      } else {
        resultsContainer.innerHTML =
          "<p class='text-center text-muted'>Search Results:</p>";
        data.forEach((user) => {
          const card = document.createElement("div");
          card.className = "col-lg-4 col-md-6 mb-4";
          card.innerHTML = `
              <div class="card shadow-sm">
                <div class="card-body">
                  <h5 class="card-title">${user.name}</h5>
                  <p class="card-text text-muted">${user.email}</p>
                  <a href="/book.html?userId=${user._id}" role="button"
              class="btn btn-warning"">Book</a>
                </div>
              </div>
            `;
          resultsContainer.appendChild(card);
        });
      }
    })
    .catch((err) => console.error("搜索失败:", err));
});

document
  .getElementById("searchForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    console.log("searching...");
    const searchQuery = document.getElementById("searchInputNav").value.trim();

    if (!searchQuery) {
      alert("Please enter users name.");
      return;
    }

    fetch(`/api/users/search-users?name=${encodeURIComponent(searchQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        const resultsContainer = document.getElementById("searchResults");
        resultsContainer.innerHTML = ""; // 清空旧搜索结果

        if (data.length === 0) {
          resultsContainer.innerHTML =
            "<p class='text-center text-muted'>No results.</p>";
        } else {
          resultsContainer.innerHTML =
            "<p class='text-center text-muted'>Search Results:</p>";
          data.forEach((user) => {
            const card = document.createElement("div");
            card.className = "col-lg-4 col-md-6 mb-4";
            card.innerHTML = `
              <div class="card shadow-sm">
                <div class="card-body">
                  <h5 class="card-title">${user.name}</h5>
                  <p class="card-text text-muted">${user.email}</p>
                  <a href="/book.html?userId=${user._id}" role="button"
              class="btn btn-warning"">Book</a>
                </div>
              </div>
            `;
            resultsContainer.appendChild(card);
          });
        }
      })
      .catch((err) => console.error("搜索失败:", err));
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

checkLoginState();
