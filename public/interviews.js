const form = document.getElementById("interview-form");
const tbody = document.getElementById("interviews-body");
const cancelBtn = document.getElementById("cancel-edit");

async function loadApplicationOptions() {
  const res = await fetch("/api/application-options");
  const apps = await res.json();
  const select = document.getElementById("app_id");
  select.innerHTML = `<option value="">-- Select Application --</option>`;

  apps.forEach(a => {
    select.innerHTML += `
      <option value="${a.app_id}">
        App #${a.app_id} - ${a.student_name} - ${a.company_name} - ${a.job_title}
      </option>
    `;
  });
}

async function loadInterviews() {
  const res = await fetch("/api/interviews");
  const rows = await res.json();

  tbody.innerHTML = "";
  rows.forEach(i => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i.round_id}</td>
      <td>${i.app_id}</td>
      <td>${i.student_name ?? ""}</td>
      <td>${i.company_name ?? ""}</td>
      <td>${i.job_title ?? ""}</td>
      <td>${i.round_type ?? ""}</td>
      <td>${i.scheduled_date ?? ""}</td>
      <td>${i.outcome ?? ""}</td>
      <td>${i.notes ?? ""}</td>
      <td class="actions">
        <button onclick="editInterview(${i.round_id})">Edit</button>
        <button class="danger" onclick="deleteInterview(${i.round_id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.editInterview = async function (id) {
  const res = await fetch(`/api/interviews/${id}`);
  const i = await res.json();

  document.getElementById("round_id").value = i.round_id;
  document.getElementById("app_id").value = i.app_id;
  document.getElementById("round_type").value = i.round_type ?? "";
  document.getElementById("scheduled_date").value = i.scheduled_date ?? "";
  document.getElementById("outcome").value = i.outcome ?? "Pending";
  document.getElementById("notes").value = i.notes ?? "";
  document.getElementById("form-title").innerText = `Edit Interview Round #${i.round_id}`;
};

window.deleteInterview = async function (id) {
  if (!confirm("Delete this interview round?")) return;

  const res = await fetch(`/api/interviews/${id}`, { method: "DELETE" });
  if (!res.ok) {
    alert("Delete failed.");
    return;
  }

  await loadInterviews();
};

function resetForm() {
  form.reset();
  document.getElementById("round_id").value = "";
  document.getElementById("outcome").value = "Pending";
  document.getElementById("form-title").innerText = "Add New Interview Round";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("round_id").value;
  const payload = {
    app_id: Number(document.getElementById("app_id").value),
    round_type: document.getElementById("round_type").value || null,
    scheduled_date: document.getElementById("scheduled_date").value || null,
    outcome: document.getElementById("outcome").value || "Pending",
    notes: document.getElementById("notes").value || null
  };

  const options = {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  };

  const url = id ? `/api/interviews/${id}` : "/api/interviews";
  const res = await fetch(url, options);

  if (!res.ok) {
    const err = await res.json();
    alert(err.error || "Failed to save interview round");
    return;
  }

  resetForm();
  await loadInterviews();
});

cancelBtn.addEventListener("click", resetForm);

async function init() {
  await loadApplicationOptions();
  await loadInterviews();
}

init();