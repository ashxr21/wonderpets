# Hope, Inc. ERP: Final Review, Retrospective and Project Report


| **Prepared by**: Scrum Master(Asher Sapurna) |


| **Date** : November 8, 2026 |


| **Stack**: React, Vite, Tailwind CSS, Supabase (PostgreSQL) |


## 1. Executive Summary and Inception Report

### Project Vision

Hope, Inc. ERP is a web-based system that manages customers, products, human resources, sales and reports in one dashboard, with role-based access for Superadmin, Admin and User. Using **Vite + React + Tailwind CSS** with a **Supabase** cloud database gave us reusable components, automatic screen updates, consistent styling and a real relational database.
This makes it a more maintainable and scalable asset  (**Maintainability, Scalability**).

The team built the project with the assistance of AI tools (Claude by Anthropic) and (Github Copilot), used as a coding and documentation assistant under the team's review and direction (**Human-in-the-Loop**).

### Core Architecture (Component Decomposition)

| Layer | Location | What it does |
|---|---|---|
| Main hub | `src/App.jsx` | Chooses between the landing page and the dashboard, and controls which login popup is open (**Conditional Rendering**) |
| Reusable pieces | `src/components/` | Split into `ui/`, `landing/`, `auth/` and `dashboard/`. One generic `RecordManager` powers several modules, so list, search, edit and delete logic is written once (**DRY Principle**) |
| Database gateway | `src/supabase/` | Creates one shared connection from `VITE_SUPABASE_URL` and the public anon key stored in `.env.local` (**Singleton Pattern, Environment-Based Configuration**) |
| Supporting layers | `src/context/`, `src/hooks/`, `src/data/`, `src/utils/` | Login state, state-to-storage synchronization, permissions, sample data and pricing logic (**Separation of Concerns**) |


## 2. Core Role Contributions

### Scrum Master (`Asher Sapurna`)

Set up the repository and Vite project, defined branch rules and the GitHub Project board, reviewed and merged pull requests, wrote peer-review comments, and tracked deployment readiness (**Version Control, Continuous Integration practices**). Assisted with the connection of the server to the supabase database.

### UI Designer (`Merlyn Angel Fadrilan`)

Converted custom layout styles into responsive Tailwind utility classes. Built shared style constants, Modal and table styling, and tab navigation with active states (**Design Systems, Responsive Design**).Assisted with the connection of the server to the supabase database.

### Developer 1 (`Althea Loribel Largo`)

Built the interface structure: Navbar, Hero, Topbar, Register modal, Dashboard Home navigation and customer module updates (**Componentization**).

### Developer 2 (`Clarence De Asis`)

Wrote the custom `useLocalStorage` hook (**Reactive State Synchronization**) and the sidebar logic that hides modules from users without permission (**Client-Side Role-Based Access Control**).

### Database Administrator (`Rozzelle Anne Aglipay`)

Prepared mock data arrays, permission rules, and the `money`, `priceFor`, `computeSales` and `readStore` helpers. Set up the Supabase schema, views and security policies (**Schema Normalization, Data Modeling**).

### Tester (`Arhiana Diego`)

Ran 4 cycles, logged runtime and layout bugs, and re-ran regression checks after each fix (**Regression Testing, Defect Tracking**).

---
## 3. AI-Assisted Development Disclosure

Our team used an AI assistant (Claude, by Anthropic) and (Github Copilot) throughout the project (**Responsible AI Use**). 
For transparency, this section states how it was used and what remained the team's responsibility.

### How AI helped

- **Starting point for the React structure:** AI produced first drafts of React components from our original HTML, CSS and JavaScript files. The team then ran, tested, debugged and extended that code (**Human-in-the-Loop**).
- **Debugging support:** explaining console and terminal errors such as failed imports, missing exports and white-screen crashes (**Root Cause Analysis**).
- **Database guidance:** walking through the Supabase setup, `.env.local` configuration and Row-Level Security policies.
- **Documentation:** drafting the plan, test log, bug reports, peer code review comments and the format of this report.

### What the team did ourselves

- Created the files, ran and tested the application, and made every final decision.
- Diagnosed problems on our own machines and applied the fixes.
- Reviewed AI output before using it, since it sometimes needed correction (for example, file-name and path mismatches in our setup).
-   Studied and practiced the Git commands needed for efficient teamwork (branching, committing, pushing, pull requests, resolving repository problems), and used them to manage our own code and reviews.
- Own the final submission.
  
> **Our approach:** AI was a productivity and learning tool, not a replacement for understanding. We treat AI output as a draft to be verified (**Human-in-the-Loop, Verification and Validation**).

---
## 4. Project Development Log and Quality Journey

Our team did not run formal, time-boxed sprints. We worked in **phases**, driven by what blocked us next, and coordinated through GitHub branches and pull requests. 
We used a sprint plan to divide tasks by role, but we did not track story points or sprint velocity, so this report does not include them. We describe the work as it actually happened (**Iterative Development, Incremental Delivery**).

### Phase 1: UI Stability

- **Problem:** a completely white screen and a scattered layout (**Rendering Error, Style Pipeline Failure**).
- **Diagnosis:** the browser console showed failed imports, and Tailwind was not initialized.
- **Resolution:** corrected component file paths and names (they are case-sensitive), added `@import "tailwindcss";` to `src/index.css`, and registered the Tailwind plugin in `vite.config.js`.

### Phase 2: Tab Breakdown

- **Problem:** the Products layout scattered, and opening Reports crashed to a white screen (**Layout Breakdown, Runtime Component Breakage**).
- **Diagnosis:** old inline elements did not match the layout system, and data mapping read from empty arrays.
- **Resolution:** replaced them with modern flex and grid wrappers and protected the data arrays with **optional chaining** (`?.`).

### Phase 3: Database Integration

- **Problem:** sign-in worked, but database records stayed invisible (**Row-Level Security lockout**).
- **Diagnosis:** the Network tab showed a successful request with an empty result, so RLS was silently blocking reads.
- **Resolution:** stored the project URL and anon key in `.env.local` (kept out of GitHub) and configured **RLS** read policies on the active views.

### How we organized the work

- Tasks were divided by role (UI, interface, logic, data, testing, coordination). Conducted meetings during work time to provided assist to each one that needed.
- Each change went through a branch and a pull request, and we left a review comment on every PR (**Peer Code Review, Traceability**).
- The Tester ran test rounds after the fixes and reported bugs back to the developers (**Regression Testing**).

### Process lesson

File-name typos (`storage,js`, `ReadManager.jsx`, `default.js`) caused several blank-page incidents. Reading the exact console error each time led straight to the fix (**Root Cause Analysis**).

---
## 5. Current Project Status and Resolution

### Resolved defect: BUG-001

- **Title:** Sales Tab Restricted for Newly Created User Accounts
- **Priority / Severity:** High / Major
- **Status:** Resolved and verified

**Symptom:** established profiles worked on every page, but a newly created account saw the Sales tab hidden.

**Root cause:** the `canModule` function in `src/context/AuthContext.jsx` had a special case for the Sales module. It required four permissions to all be true (`sales.view`, `customers.view`, `products.view` and `hr.view`) before showing the tab. Newly created accounts start with no module rights, so the check always failed (**Over-Restrictive Access Control Logic**).

**Resolution:** the team removed the special case, so every module, including Sales, now uses the same rule: `return can(`${module}.view`)`. Access to Sales now depends only on the `sales.view` permission (**Consistent Authorization Logic, Principle of Least Privilege**).

**Verification:** the Tester registered a fresh account, confirmed the Sales tab appears once `sales.view` is granted, and ran a regression pass across all tabs (**Regression Testing**). Result: **Pass**.

### Project status

- No open critical or major defects.
- Core modules, login and the Supabase connection are working.
- Access rules in place: only verified, reachable emails can register, and only a **Superadmin** can promote a user to Admin or Superadmin (**Privilege Escalation Prevention**).

### Possible future improvements

- [ ] Migrate any remaining modules from browser storage to Supabase.
- [ ] Add Row-Level Security policies for write access, so permissions are enforced in the database and not only in the interface.
- [ ] Add a database trigger that creates a profile row on signup, if the team wants new users linked to the `employee` table.
- [ ] Add automated tests and a deployment pipeline (**Continuous Integration**).
---
## 6. Final Team Retrospective

### What went well

1. **Cross-functional collaboration.** Each role owned a clear layer (design, interface, logic, data, testing), and the team coordinated through GitHub.
2. **Git branch control.** Feature branches and pull requests meant every change was reviewed, and we left a review comment on every PR (**Peer Code Review, Traceability**).
3. **Using AI responsibly.** We used an AI assistant (Claude) for first drafts, error explanations and documentation, and we always read, tested and verified the output ourselves (**Human-in-the-Loop**).
4. **Finishing the open defect.** The team diagnosed BUG-001 together (developer, DBA and tester) and closed it with a verified fix (**Root Cause Analysis**).

### What we can improve

1. **Coordinate early on shared files.** Files such as `DashboardLayout.jsx` and `App.jsx` were touched by several people, and some pushes left files empty or misnamed. Next time we will agree on ownership and add a "page must load before review" rule (**Merge Conflict Prevention, Definition of Done**).
2. **Design the database schema before the UI.** Our mock data used camelCase while the database uses lowercase column names, so migration needed extra mapping. Settling the schema first would have avoided this (**Schema Alignment, Data-First Design**).
3. **Verify AI output earlier.** Some AI-suggested code and file names did not match our actual project, which caused blank-page bugs. In future we will test each AI-generated file immediately and keep a short log of what was AI-assisted (**Traceability**).
4. **Follow our own process.** We planned a task breakdown by role but did not follow a formal sprint cycle or track progress consistently. Next time we will plan short, time-boxed iterations, update the task board regularly, and measure our pace (**Iterative Planning, Progress Tracking**).

## 7. Closing Statement

The core framework is structurally stable and complete. The team delivered a working, styled and reviewed application with a live Supabase connection, and the last known defect (**BUG-001**) has been resolved and verified. The project is ready for submission.

**Scrum Master:** Asher Sapurna 

**Date:** November 8, 2026
