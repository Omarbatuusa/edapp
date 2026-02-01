
export const DEFAULT_TERMS = `
## 1) EdApp Terms of Use (Platform)

### 1.1 Who we are
EdApp (edapp.co.za) provides a school “super-app” platform used by participating schools/brands/campuses (“Schools”) to manage admissions, communication, attendance, learning, payments, printing governance, and community features.
**Support email:** admin@edapp.co.za

### 1.2 These Terms
These Terms apply when you access or use EdApp websites, apps, and services (the “Services”), including:
* Tenant discovery (e.g., \`app.edapp.co.za\`)
* Tenant portals (e.g., \`{tenant}.edapp.co.za\`)
* Admissions portals (e.g., \`apply-{tenant}.edapp.co.za\`)
* Platform admin (e.g., \`admin.edapp.co.za\`)

If you use EdApp on behalf of a School or organisation, you confirm you have authority to bind that organisation.

### 1.3 Accounts and access
You must keep your login details secure and not share them. You are responsible for activity performed through your account unless you can show it was accessed without your authorisation.
We may restrict, suspend, or terminate access where we reasonably believe:
* the account is compromised,
* there is misuse, unlawful activity, or serious policy breaches,
* we must do so to protect learners, staff, parents, or the platform.

### 1.4 Acceptable use (summary)
You may not:
* harass, bully, threaten, discriminate, or incite harm;
* upload unlawful content (including child sexual abuse material, hate content, or content that violates privacy);
* attempt unauthorised access, probing, or interference with EdApp systems (including API abuse);
* impersonate others or misrepresent authority.

Full rules appear in the **Acceptable Use Policy** and **Child Safety & Community Rules** (below). (They are incorporated into these Terms.)

### 1.5 School relationship and responsibility
Schools decide what modules they enable, how they set policies, and what data they collect (within the law). The School is typically the **Responsible Party** under POPIA for learner/parent/staff data processed for school operations; EdApp generally acts as an **Operator** processing data on the School’s instructions.

### 1.6 Content you submit
You retain ownership of content you submit (e.g., documents, messages). You grant EdApp and the relevant School a limited licence to host, process, and display that content solely to provide the Services, enforce safety rules, and meet legal obligations.

### 1.7 Platform availability
We aim for high availability but do not guarantee uninterrupted service. Maintenance or outages may occur. We may update features for security, compliance, and performance.

### 1.8 Fees, payments, and refunds
If a School enables fees, wallet top-ups, tuckshop/uniform/event payments, or printing charges:
* Payment terms, fee schedules, and refund rules are set by the School (unless EdApp is explicitly the merchant of record).
* You must follow the School’s payment instructions and deadlines.

### 1.9 Electronic communications and records
You agree EdApp may provide notices, receipts, and confirmations electronically (in-app, email, or other enabled channels). This aligns with South Africa’s recognition of electronic communications/records.

### 1.10 Limitation of liability
To the maximum extent permitted by law, EdApp is not liable for indirect losses (loss of profits, business interruption) and is not responsible for decisions made by Schools or users. Nothing here limits liability where it cannot legally be limited.

### 1.11 Changes
We may update these Terms. If changes are material, we will notify users and request re-acceptance where appropriate.

### 1.12 Contact and complaints
Support: admin@edapp.co.za
POPIA queries: see Privacy Notice (below).
`;

export const DEFAULT_PRIVACY = `
## 2) Privacy Notice (POPIA) — EdApp + Schools

### 2.1 Purpose of this notice
This Privacy Notice explains how personal information is collected, used, shared, protected, and retained when you use EdApp.

### 2.2 Roles under POPIA
Depending on the activity:
* The **School** is usually the **Responsible Party** for school operations data (admissions, attendance, academics, discipline, billing).
* **EdApp** is usually an **Operator** processing on the School’s instructions, and a Responsible Party for limited platform-level administration and security (e.g., platform audit logs, abuse prevention, tenant routing protection).

### 2.3 What personal information we process
**Identity & contact:** name, email, phone, role, language preference.
**Learner info (school operations):** student number, grade/class, attendance, homework/submissions, academic records, behaviour/discipline, welfare incidents (restricted).
**Admissions:** applicant details, guardian details, supporting documents, application status timeline.
**Payments/wallet (if enabled):** transactions, receipts, fee statements, payment references.
**Printing governance (if enabled):** print job metadata (user, pages, duplex/colour, printer, time).
**Device/security:** login events, IP, device identifiers for security/rate limiting, audit trails.
**Communications:** messages, announcements, support tickets, attachments.

### 2.4 Children’s information and guardian authority
Where learner information is processed, the School and EdApp rely on the authority of a parent/guardian/responsible person (or school authority where applicable). The platform uses “privacy-by-default” controls and restricted access for safeguarding/medical information.

### 2.5 Why we process information (purposes)
We process information to:
* verify users and prevent abuse;
* deliver school services (attendance, academics, admissions, finance, communications);
* provide safety and safeguarding tools (incident reporting, emergency broadcasts);
* generate records and reports (including audit trails);
* comply with legal obligations and enforce platform rules.

### 2.6 Lawful bases / processing grounds (POPIA)
Processing is based on one or more of:
* performance of a contract (providing the Services),
* compliance with legal obligations,
* legitimate interests (security, anti-fraud, service improvement),
* consent where required (e.g., optional marketing; some direct marketing contexts).

### 2.7 Sharing and disclosure
We may share information with:
* the relevant School and authorised staff (role-based access),
* payment providers (if enabled),
* messaging/email providers (e.g., SES for school emails where configured),
* cloud infrastructure providers (hosting/storage), under strict controls,
* law enforcement/regulators where legally required.
We do **not** sell personal information.

### 2.8 Cross-border processing
Some service providers may process data outside South Africa. Where this occurs, we apply contractual and technical safeguards consistent with POPIA requirements for cross-border transfers.

### 2.9 Security safeguards
We use layered security including:
* tenant isolation and role-based access control,
* encryption in transit, secure storage controls,
* audit logging for sensitive actions,
* rate limiting, bot protection for auth endpoints,
* least-privilege access for staff and service accounts.
Unauthorised access and cyber-offences are prohibited under South African law.

### 2.10 Retention
We retain information only as long as needed for:
* school operations and legal retention requirements,
* dispute resolution and audit trails,
* platform security.
Schools can set retention rules per module where supported. Deletion may be constrained where a legal basis requires retention.

### 2.11 Your rights (POPIA)
Subject to POPIA, you may request:
* access to your personal information,
* correction or deletion (where applicable),
* objection to processing on reasonable grounds,
* withdrawal of consent where processing is consent-based,
* complaint escalation to the Information Regulator.

### 2.12 Contact
Privacy requests and POPIA queries: **admin@edapp.co.za**
(Include your tenant/school name and the email/phone used to sign in.)
`;

export const DEFAULT_COOKIES = `
## 3) Cookie Policy

EdApp uses cookies/local storage to:
* keep you signed in (session),
* remember preferences (language, theme, last role),
* protect against fraud/abuse (rate limiting tokens),
* measure performance and reliability (non-intrusive analytics where enabled).

You can disable cookies in your browser, but some features may not function.
Where consent is required for non-essential cookies, EdApp will prompt you and record your choice.
`;

export const DEFAULT_CHILD_SAFETY = `
## 4) Child Safety & Community Rules (Safeguarding)

### 4.1 Purpose
EdApp is designed to be a **school-safe** environment. Learner wellbeing is a priority and content/community features include moderation and reporting.

### 4.2 Zero-tolerance content
The following is prohibited and will result in immediate enforcement action:
* any sexual content involving minors or exploitation of learners,
* grooming behaviour, coercion, threats, extortion,
* content promoting self-harm, violence, or criminal activity,
* hate speech or discriminatory harassment,
* doxxing or sharing private info without authority.

### 4.3 Learner protection controls (platform defaults)
* Learner direct messaging can be restricted or disabled by the School.
* Learner posts can require approval (default recommended for younger phases).
* Reporting tools: “Report message/post”, plus a discreet “Help” pathway where enabled.
* Staff/admin escalation workflows and audit logging.

### 4.4 Reporting and response
If you see unsafe behaviour:
* use **Report** in the message/post menu,
* or contact the School directly via the **Support Ticket** categories (where enabled),
* for emergencies, follow the School’s emergency instructions.

EdApp and Schools may preserve evidence, restrict access, and cooperate with lawful investigations.
`;

export const DEFAULT_ACCEPTABLE_USE = `
## 5) Acceptable Use Policy (AUP)

You agree not to:
* use EdApp to bully, harass, intimidate, or embarrass others;
* upload malware, attempt to hack, scrape, or disrupt systems;
* bypass access controls or use another user’s account;
* share copyrighted material unlawfully;
* post content that is obscene, hateful, or unlawful.

EdApp may remove content, restrict features, or suspend accounts to protect learners and the platform.
`;

export const DEFAULT_COMMUNICATIONS = `
## 6) Communications & Notifications Policy

EdApp can send messages via:
* **in-app notifications** (default),
* **push notifications** (optional),
* **email** (operational + school communications),
* **SMS** (optional; cost-controlled by the School).

### Operational vs marketing
* **Operational communications** include safety alerts, attendance notices, admissions updates, fee statements, and policy notices.
* **Marketing** is optional and requires explicit opt-in where applicable, with an easy opt-out.

You can control preferences inside EdApp, except for critical safety alerts which may override preferences if the School enables that policy.
`;

export const DEFAULT_POPIA = DEFAULT_PRIVACY; // Reusing privacy notice content for POPIA notice
