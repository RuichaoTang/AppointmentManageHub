let currentPage = 1;
const appointmentsPerPage = 6; // 每页显示的预约数量
let allAppointments = []; // 存储所有预约
let filteredAppointments = []; // 存储过滤后的预约

// 检查登录状态并加载预约
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

    await loadAppointments(data.user.id);
  } else {
    document.getElementById("loginBtn").classList.remove("d-none");
    document.getElementById("signupBtn").classList.remove("d-none");
    document.getElementById("logoutBtn").classList.add("d-none");
    document.getElementById("myBtn").classList.add("d-none");

    window.location.href = "/";
  }
}

// 加载用户的预约
async function loadAppointments(userId) {
  const response = await fetch(`/api/appointments/get/${userId}`, {
    method: "GET",
    credentials: "include",
  });

  allAppointments = await response.json();
  filteredAppointments = allAppointments; // 初始显示所有预约
  renderAppointments();
}

// 渲染预约列表
function renderAppointments() {
  const startIndex = (currentPage - 1) * appointmentsPerPage;
  const endIndex = startIndex + appointmentsPerPage;
  const appointmentsToShow = filteredAppointments.slice(startIndex, endIndex);

  const appointmentsList = document.getElementById("appointmentsList");
  appointmentsList.innerHTML = ""; // 清空现有的内容

  if (appointmentsToShow.length > 0) {
    appointmentsToShow.forEach((appointment) => {
      const appointmentCard = document.createElement("div");
      appointmentCard.classList.add("col");

      appointmentCard.innerHTML = `
              <div class="card h-100 shadow-sm">
                <div class="card-body">
                  <h5 class="card-title">${appointment.by}</h5>
                  <p class="card-text"><strong>Email:</strong> ${appointment.email}</p>
                  <p class="card-text"><strong>Date:</strong> ${appointment.date}</p>
                  <p class="card-text"><strong>Time:</strong> ${appointment.time}</p>
                  <p class="card-text"><strong>Notes:</strong> ${appointment.comments || "None"}</p>
                  <p class="card-text">
                    <strong>Status:</strong>
                    <span class="badge ${appointment.confirmed ? "bg-success" : "bg-warning"}">
                      ${appointment.confirmed ? "Confirmed" : "Not Confirmed"}
                    </span>
                  </p>
                  <!-- Buttons for unconfirmed appointments -->
                  ${
                    !appointment.confirmed
                      ? `
                    <div class="d-grid gap-2">
                      <button class="btn btn-success confirm-btn" data-id="${appointment._id}">Confirm Appointment</button>
                      <button class="btn btn-danger cancel-btn" data-id="${appointment._id}">Cancel Appointment</button>
                    </div>
                  `
                      : ""
                  }
                </div>
              </div>
            `;

      appointmentsList.appendChild(appointmentCard);
    });

    // 添加事件监听器
    const confirmButtons = document.querySelectorAll(".confirm-btn");
    confirmButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const appointmentId = this.getAttribute("data-id");
        confirmAppointment(appointmentId);
      });
    });

    const cancelButtons = document.querySelectorAll(".cancel-btn");
    cancelButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const appointmentId = this.getAttribute("data-id");
        cancelAppointment(appointmentId);
      });
    });
  } else {
    appointmentsList.innerHTML =
      "<p class='text-center w-100'>No appointments found.</p>";
  }

  // 更新分页按钮状态和页码显示
  updatePaginationButtons();
  updateCurrentPageDisplay();
}

// 更新分页按钮状态
function updatePaginationButtons() {
  const prevPageBtn = document.getElementById("prevPageBtn");
  const nextPageBtn = document.getElementById("nextPageBtn");

  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled =
    currentPage * appointmentsPerPage >= filteredAppointments.length;
}

// 更新当前页码显示
function updateCurrentPageDisplay() {
  const currentPageElement = document.getElementById("currentPage");
  currentPageElement.textContent = `Page ${currentPage}`;
}

// 上一页
document.getElementById("prevPageBtn").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderAppointments();
  }
});

// 下一页
document.getElementById("nextPageBtn").addEventListener("click", () => {
  if (currentPage * appointmentsPerPage < filteredAppointments.length) {
    currentPage++;
    renderAppointments();
  }
});

// 显示所有预约
document.getElementById("showAllBtn").addEventListener("click", () => {
  filteredAppointments = allAppointments;
  currentPage = 1;
  renderAppointments();
});

// 显示已确认的预约
document.getElementById("showConfirmedBtn").addEventListener("click", () => {
  filteredAppointments = allAppointments.filter((app) => app.confirmed);
  currentPage = 1;
  renderAppointments();
});

// 显示未确认的预约
document.getElementById("showUnconfirmedBtn").addEventListener("click", () => {
  filteredAppointments = allAppointments.filter((app) => !app.confirmed);
  currentPage = 1;
  renderAppointments();
});

// 确认预约
async function confirmAppointment(appointmentId) {
  try {
    const response = await fetch(`/api/appointments/confirm/${appointmentId}`, {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      alert("Appointment confirmed.");
      window.location.reload(); // 重新加载页面以更新状态
    } else {
      alert("Failed to confirm appointment.");
    }
  } catch (error) {
    console.error("Error confirming appointment:", error);
  }
}

// 取消预约
async function cancelAppointment(appointmentId) {
  try {
    const response = await fetch(`/api/appointments/cancel/${appointmentId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.ok) {
      alert("Appointment canceled.");
      window.location.reload(); // 重新加载页面以更新状态
    } else {
      alert("Failed to cancel appointment.");
    }
  } catch (error) {
    console.error("Error canceling appointment:", error);
  }
}

// 登出
document
  .getElementById("logoutBtn")
  .addEventListener("click", async function () {
    const confirmLogout = confirm("Are you sure to log out?");
    if (confirmLogout) {
      await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
      });

      window.location.href = "/";
    }
  });

// 页面加载时检查登录状态
document.addEventListener("DOMContentLoaded", checkLoginState);
