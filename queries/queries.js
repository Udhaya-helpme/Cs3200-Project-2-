db.applications.aggregate([
    { $group: { _id: "$company.industry", total_applications: { $sum: 1 } } },
    { $sort: { total_applications: -1 } }
  ]);
  
  db.applications.find({
    $and: [
      { is_active: true },
      {
        $or: [
          { "job_posting.type": "co-op" },
          { "job_posting.type": "internship" }
        ]
      },
      { "job_posting.pay_per_hour": { $gte: 30 } }
    ]
  });
  
  db.applications.countDocuments({ user_id: 1 });
  
  db.applications.updateOne(
    { user_id: 1 },
    { $set: { is_active: false } }
  );
  
  db.applications.find(
    { current_status: "Offer" },
    { "company.name": 1, "job_posting.title": 1, applied_date: 1, _id: 0 }
  ).sort({ applied_date: -1 });