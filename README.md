# Cs3200-Project-2-
# Internship Application Tracker — Project 2
**Author:** Udhaya Bhuvanesh  
**Course:** CS3200 — Database Design

## Overview
A MongoDB redesign of the Internship Application Tracker from Project 1. The 12 relational tables from PostgreSQL are collapsed into 2 collections — `users` and `applications` — using embedded documents instead of joins.

## Collections
- **users** — one document per student (name, email, university, major, graduation year)
- **applications** — one document per job application, with company, job posting, status history, interviews, offer, contacts, and tags all embedded inside

## How to Initialize the Database
```bash
mongorestore --db internship_tracker ./dump/internship_tracker
```
Or import manually:
```bash
mongoimport --db internship_tracker --collection users --file users.json --jsonArray
mongoimport --db internship_tracker --collection applications --file applications_reshaped.json --jsonArray
```

## Queries
```bash
mongosh
use internship_tracker
```
Then paste any query from `queries.js`.

| # | Description | Requirement |
|---|---|---|
| Q1 | Applications grouped by industry | Aggregation |
| Q2 | Active co-op/internship apps paying $30+/hr | $and + $or |
| Q3 | Count applications for user_id 1 | Count |
| Q4 | Flip is_active to false for user_id 1 | Update |
| Q5 | All offers sorted by most recent | General query |
