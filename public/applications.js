const form = document.getElementById("application-form");
const tbody = document.getElementById("applications-body");
const cancelBtn = document.getElementById("cancel-edit");

async function loadStudents() {
  const res = await fetch("/api/students");
  const students = await res.json();
  const select = document.getElementById("student_id");
  select.innerHTML = `<option value="">-- Select Student --</option>`;
  students.forEach(s => {
    select.innerHTML += `<option value="${s.student_id}">${s.name} (ID ${s.student_id})</option>`;
  });
}

async function loadJobs() {
  const res = await fetch("/api/jobs");
  const jobs = await res.json();
  const select = document.getElementById("job_id");
  select.innerHTML = `<option value="">-- Select Job --</option>`;
  jobs.forEach(j => {
    select.innerHTML += `<option value="${j.job_id}">${j.company_name} - ${j.title} (ID ${j.job_id})</option>`;
  });
}

async function loadApplications() {
  const res = await fetch("/api/applications");
  const rows = await res.json();

  tbody.innerHTML = "";
  rows.forEach(a => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${a.app_id}</td>
      <td>${a.student_name ?? ""}</td>
      <td>${a.company_name ?? ""}</td>
      <td>${a.job_title ?? ""}</td>
      <td>${a.submission_date ?? ""}</td>
      <td>${a.current_status ?? ""}</td>
      <td>${a.notes ?? ""}</td>
      <td class="actions">
        <button onclick="editApplication(${a.app_id})">Edit</button>
        <button class="danger" onclick="deleteApplication(${a.app_id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.editApplication = async function (id) {
  const res = await fetch(`/api/applications/${id}`);
  const a = await res.json();

  document.getElementById("app_id").value = a.app_id;
  document.getElementById("student_id").value = a.student_id;
  document.getElementById("job_id").value = a.job_id;
  document.getElementById("submission_date").value = a.submission_date ?? "";
  document.getElementById("current_status").value = a.current_status ?? "";
  document.getElementById("notes").value = a.notes ?? "";
  document.getElementById("form-title").innerText = `Edit Application #${a.app_id}`;
};

window.deleteApplication = async function (id) {
  if (!confirm("Delete this application?")) return;

  const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
  if (!res.ok) {
    alert("Delete failed. This application may be referenced by another table.");
    return;
  }

  await loadApplications();
};

function resetForm() {
  form.reset();
  document.getElementById("app_id").value = "";
  document.getElementById("form-title").innerText = "Add New Application";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("app_id").value;
  const payload = {
    student_id: Number(document.getElementById("student_id").value),
    job_id: Number(document.getElementById("job_id").value),
    submission_date: document.getElementById("submission_date").value || null,
    current_status: document.getElementById("current_status").value || null,
    notes: document.getElementById("notes").value || null
  };

  const options = {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  };

  const url = id ? `/api/applications/${id}` : "/api/applications";
  const res = await fetch(url, options);

  if (!res.ok) {
    const err = await res.json();
    alert(err.error || "Failed to save application");
    return;
  }

  resetForm();
  await loadApplications();
});

cancelBtn.addEventListener("click", resetForm);

async function init() {
  await loadStudents();
  await loadJobs();
  await loadApplications();
}

init();