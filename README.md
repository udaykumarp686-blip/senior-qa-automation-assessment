# Senior QA Automation Engineer Assessment

A self-contained assessment scaffold demonstrating a TypeScript + Playwright automation framework, Page Object Model, API checks, role-based UI validation, GitHub Actions CI, failure artifacts, and a k6 performance test.

> **Important:** The assignment did not include a target application URL or API contract. This repository includes a small local demo application so the framework can be run and demonstrated immediately. Before submission, disclose this design decision and replace/adapt the demo endpoints, locators, and authentication to the actual target application if the recruiter provides one. Do not claim the demo is the employer's application.

## Coverage

- Authentication (admin and viewer)
- Employee create, read/API verify, update, delete
- Role-based validation (viewer is read-only)
- POM (`LoginPage`, `EmployeesPage`)
- Environment configuration
- Reusable API client and unique test data
- Playwright retries in CI, smart locator-based waits, screenshots/videos/traces on failure
- HTML and JUnit reports
- GitHub Actions matrix sharding for parallel execution and artifact upload
- k6 login + employee-create performance scenario with thresholds

## Requirements

- Node.js 20+
- npm
- Optional: k6 for performance test

## Setup

```bash
npm install
npx playwright install --with-deps chromium
cp .env.example .env
```

Windows PowerShell alternative:

```powershell
Copy-Item .env.example .env
```

## Run locally

Terminal 1 (optional if Playwright webServer starts the demo automatically):

```bash
npm run demo
```

Terminal 2:

```bash
npm run typecheck
npm test
```

Playwright starts the demo automatically unless `USE_EXTERNAL_APP=true`. The default URL is `http://127.0.0.1:3000`.

Open the report:

```bash
npm run report
```

## Demo credentials

- Admin: `admin@example.com` / `Admin123!`
- Viewer: `viewer@example.com` / `Viewer123!`

These are local demo-only credentials. Never use these credentials for a real environment.

## Environment configuration

Set `BASE_URL`, `API_BASE_URL`, `TEST_USERNAME`, `TEST_PASSWORD`, `VIEWER_USERNAME`, and `VIEWER_PASSWORD`. For an external app, set `USE_EXTERNAL_APP=true` and update page objects, endpoint paths, payloads, and authentication to match the target. Store secrets in GitHub Actions Secrets; do not commit real credentials.

## Tags

- `@smoke`: critical end-to-end employee lifecycle
- `@regression`: broad lifecycle and role validation
- `@api`: API-level tests

Examples:

```bash
npm run test:smoke
npm run test:regression
npm run test:api
npm run test:ui
```

## CI/CD

Workflow: `.github/workflows/ci.yml`

On push and pull request, GitHub Actions installs Node dependencies and Chromium, type-checks TypeScript, runs Playwright tests in two shards, and uploads HTML reports, JUnit output, screenshots, videos, and traces as artifacts. CI uses two retries and two workers to balance resilience and throughput. For a production repo, pin actions to reviewed commit SHAs and use protected environments/secrets.

## Performance test (bonus)

Install k6 using the official instructions for your OS, start the demo server, then run:

```bash
k6 run k6/login-and-employee.js
```

To point it at another environment:

```bash
API_BASE_URL=https://your-host.example/api TEST_USERNAME=... TEST_PASSWORD=... k6 run k6/login-and-employee.js
```

PowerShell:

```powershell
$env:API_BASE_URL="http://127.0.0.1:3000/api"
k6 run .\k6\login-and-employee.js
```

Thresholds: failed HTTP requests below 1%, p95 request duration below 500ms, and checks above 99%. These are starter targets; agree service-level objectives with the application team before treating them as release gates. The script cleans up created records when creation succeeds.

## Reliability strategy

- **Smart waits:** use Playwright's auto-waiting locators and web-first assertions rather than fixed sleeps.
- **Retries:** CI retries failed tests twice; retries are diagnostic, not a substitute for fixing unstable tests.
- **Failure evidence:** screenshots, video, and trace are retained on failure. Inspect the trace before rerunning.
- **Flaky test detection:** monitor tests that pass on retry, track retry rate by test/branch, and report recurring offenders. A test that fails initially but passes on retry should be investigated, not silently counted as healthy.
- **Mitigation:** isolate test data, avoid shared mutable state, use unique records, prefer stable accessible locators, wait for observable application state, stub only unstable external dependencies when appropriate, and remove race conditions. Quarantine only temporarily with an owner and expiry date.
- **Data strategy:** generated unique emails prevent collisions; lifecycle tests clean up created employees. The demo app stores data in memory and resets when restarted.

## Architecture

```text
src/
  config/env.ts           # environment settings
  pages/                  # Page Object Model
  utils/apiClient.ts      # reusable API operations
  utils/testData.ts       # isolated unique test data
tests/
  ui/                     # browser end-to-end scenarios
  api/                    # API lifecycle and auth checks
demo/server.ts            # local sample app only
k6/                       # performance scenario
.github/workflows/ci.yml  # CI, sharding, artifact upload
```

## Design decisions and known limitations

1. **Target unspecified:** local demo app is a runnable substitute, not a representation of a real client application.
2. **Role checks:** the demo enforces Admin authorization server-side for mutations; viewer UI hides mutation controls.
3. **Authentication:** demo uses in-memory bearer tokens only; it is not production authentication.
4. **Persistence:** data is in-memory, so it resets on process restart.
5. **API contract:** update status codes/payloads if the target application differs.
6. **CI:** reports are uploaded as artifacts. GitHub Pages publication is intentionally not configured because it can expose test data.
7. **Performance:** k6 numbers are meaningful only when run against a representative environment; the demo is for validating script mechanics.

## Submission checklist

- [ ] Replace demo-specific locators/API contract with actual target details if available.
- [ ] Run `npm run typecheck` and `npm test`; fix failures.
- [ ] Inspect HTML report and failure artifacts.
- [ ] Run k6 if the bonus is included.
- [ ] Remove secrets and local artifacts that should not be public.
- [ ] Push to GitHub and grant repository access to `priyadarsini.ps@reflectionsinfos.com`.
- [ ] Verify the reviewer can access the repository and README.
