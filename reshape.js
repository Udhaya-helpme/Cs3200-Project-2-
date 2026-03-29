const fs = require("fs");

const raw = JSON.parse(fs.readFileSync("applications.json", "utf8"));

const statuses = ["Applied", "OA", "Interviewing", "Offer", "Rejected", "Withdrawn"];

const reshaped = raw.map((row, i) => {
  const statusIndex = statuses.indexOf(row.current_status);
  const validIndex = statusIndex === -1 ? 0 : statusIndex;

  const statusHistory = statuses.slice(0, validIndex + 1).map((s, j) => ({
    status: s,
    changed_at: new Date(
      new Date(row.applied_date).getTime() + j * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    notes: ""
  }));

  const interviews =
    ["Interviewing", "Offer"].includes(row.current_status)
      ? [
          {
            round: 1,
            type: "Technical",
            scheduled_date: new Date(
              new Date(row.applied_date).getTime() + 14 * 24 * 60 * 60 * 1000
            ).toISOString(),
            outcome: "Passed",
            notes: "Generated test interview"
          }
        ]
      : [];

  const offer =
    row.current_status === "Offer"
      ? {
          compensation: row.pay_per_hour,
          deadline: new Date(
            new Date(row.applied_date).getTime() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          notes: "Generated test offer"
        }
      : null;

  return {
    user_id: row.user_id,
    applied_date: new Date(row.applied_date).toISOString(),
    current_status: row.current_status,
    is_active: row.is_active,
    notes: row.notes || "",
    company: {
      name: row.company_name,
      industry: row.company_industry,
      hq_location: row.company_location
    },
    job_posting: {
      title: row.job_title,
      type: row.job_type,
      pay_per_hour: parseFloat(row.pay_per_hour),
      is_remote: row.is_remote,
      job_board: {
        name: row.job_board,
        url: ""
      }
    },
    status_history: statusHistory,
    interviews: interviews,
    offer: offer,
    contacts: [],
    tags: [row.job_type, row.company_industry]
  };
});

fs.writeFileSync("applications_reshaped.json", JSON.stringify(reshaped, null, 2));
console.log(`Done — ${reshaped.length} documents written to applications_reshaped.json`);
