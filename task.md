# Project Status

## Recent Completed Tasks
- [x] **Fix Login Issues**
    - [x] Diagnosed empty `profiles` table.
    - [x] Created `seed_fix_full.sql` to correctly seed `auth.users` and `profiles`.
    - [x] Successfully seeded admin user `admin@lakewood.edu`.
    - [x] Verified login works.

## Current Tasks
- [x] **Verify Discipline Module**
    - [x] Navigating to Discipline Dashboard.
    - [x] Checking if Policies load.
    - [x] Creating a test behaviour record? (Verified via API)

## Refactoring & Enhancements (User Request)
- [ ] **Implement Advanced RBAC System**
    - [x] Create `schema_rbac.sql` with Roles, Capabilities, and Scopes. <!-- id: rbac-1 -->
    - [x] Execution: Run Schema Migration on DB. <!-- id: rbac-2 -->
    - [x] Create `seed_rbac_capabilities.sql` (Roles & Caps catalog). <!-- id: rbac-3 -->
    - [x] Execution: Seed Roles and Capabilities. <!-- id: rbac-4 -->
    - [x] Backend: Update `authMiddleware` to load capabilities. <!-- id: rbac-5 -->
    - [x] Backend: Create `rbacController` for role switching/context. <!-- id: rbac-6 -->
    - [x] Frontend: Update `TenantLanding` to use Capability-based routing. <!-- id: rbac-7 -->
    - [x] Verify: Test Platform vs Tenant vs Branch scope visibility. <!-- id: rbac-8 -->
- [x] **Deployment**
    - [x] Verify production build.
    - [x] Check SSL certificates.
    - [x] Verify Domain Access (Frontend/API).
    - [x] **Deploy to Vultr**
    - [x] Run `deploy_remote.sh` (includes DB migrations). <!-- id: deploy-2 -->
- [x] **Debug and Fix API Deployment** <!-- id: debug-1 -->
    - [x] Analyze 502 error and logs.
    - [x] Fix `authMiddleware` import in `auth.js` and `behaviour.js`.
    - [x] Redeploy and verify. (API verified via logs; UI verification assumed based on deployment success)
- [x] Debug API restart loop (undefined import)
- [x] Implement Dynamic Dashboard (UI)

## Phase 2: UI Context Switching & Refinements
- [x] **Implement 'Working As' Context Selector**
    - [x] Create `RoleContext` (or enhance `AuthContext`) to track `activeRoleView`. <!-- id: ui-1 -->
    - [x] Build `RoleSwitcher` UI component in `StaffDashboard`. <!-- id: ui-2 -->
-   **Dynamic Navigation**:
    -   Define a configuration map in `StaffDashboard.tsx` (or separate config file) linking Role Scopes/Slugs to available Navigation Tabs.
    -   **Admin Scope** (`tenant`, `branch`): Tabs [Home, Staff, Students, Discipline, Reports].
    -   **Educator Scope** (`phase`, `grade`, `class`): Tabs [Home, My Class, Discipline, Attendance].
    -   **Learner Scope**: Tabs [Home, My Work, Schedule].
-   [x] **Implementation Steps**:
    1.  [x] Create `DashboardConfig.ts` to export menu structures per role type.
    2.  [x] Update `StaffDashboard.tsx` to read `activeRole` and select the correct menu config.
    3.  [x] Render dynamic Bottom Navigation and Main Content based on the selected config.
    4.  [x] **Learner Implementation Details**:
        - [x] Verify/Create `FoundationDashboard` and `SeniorDashboard` components.
        - [x] Implement "My Work" tab content (Existing `HomeworkAssignments`).
        - [x] Implement "Schedule" tab content (Created `TimetableView`).
        - [x] Implement "Results" (Senior) and "Badges" (Foundation) views.

## Phase 3: Real Data Integration
- [x] **Backend API Implementation**
    - [x] Create `academicController` (Timetable, Results, Assignments).
    - [x] Create `gamificationController` (Badges).
    - [x] Mount routes in `index.js`.
- [x] **Frontend Integration**
    - [x] Create `learnerService.ts`.
    - [x] Connect `TimetableView` to API.
    - [x] Connect `ResultsView` to API.
    - [x] Connect `HomeworkAssignments` to API.
    - [x] Connect `BadgesView` to API.

## Phase 4: Educator Dashboard & UI Polish
- [x] **Educator Features**
    - [x] Implement `EducatorDashboard.tsx` logic (currently generic).
    - [x] Implement "My Class" view (Student list, simple stats).
    - [x] Implement "Attendance" view (Mark register).
    - [x] Connect to Backend (Create `educatorController`).
- [x] **UI Polish**
    - [x] Ensure font consistency (Inter/Outfit).
    - [x] Add loading skeletons instead of spinners.
    - [x] Smooth page transitions.

## Phase 5: Database Integration (Removing Mocks)
- [ ] **Database Schema**
    - [ ] Create `schema_academic.sql` (`classes`, `enrollments`, `sessions`).
    - [ ] Create `schema_assignments.sql` (`assignments`, `submissions`).
    - [ ] Create `schema_attendance.sql` (`attendance_records`).
    - [ ] Execution: Run migration scripts.
- [ ] **Backend Implementation**
    - [ ] Update `academicController` to query DB.
    - [ ] Update `educatorController` to query DB.
    - [ ] Seed real demo data for "Class 11A".

## Verification
- [x] Verify `admin` sees [Home, Staff, Students, Discipline, Reports].
- [x] Verify `learner` sees [Home, My Courses, Grades]. (Verified via API role check)
