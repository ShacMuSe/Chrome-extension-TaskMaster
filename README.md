# TaskMaster

**Turn everyday tasks into experience points.** TaskMaster is a Chrome extension backed by a Django REST API. Create tasks, estimate their difficulty and duration, track completion, and earn XP to progress through levels. A leaderboard displays the three users with the most XP.

## Features

- Account registration and username/password login using JWT access and refresh tokens.
- Create, view, edit, delete, and toggle completion of personal tasks.
- Five difficulty levels and estimated task duration in minutes.
- XP rewards, level progression, and a user profile with ranking.
- Top-three leaderboard ordered by experience points.
- Browser-side token and profile caching with `chrome.storage.local`.

## Technology stack

| Layer | Technologies |
| --- | --- |
| Extension | Chrome Manifest V3, JavaScript, HTML, CSS, Fetch API |
| API | Python, Django, Django REST Framework, Simple JWT |
| Database | SQLite |
| Browser integration | Chrome Storage API and background service worker |
| Additional frontend scaffold | React 18, Create React App, Axios, React Router |

## How it works

The popup sends requests to `http://localhost:8000/api/`. Django stores tasks and user profiles in SQLite. Authenticated requests include a JWT bearer token. Task queries are scoped to the logged-in user, and the completion endpoint checks task ownership.

Completing a task through the toggle endpoint awards XP; undoing completion subtracts XP according to its current difficulty.

| Difficulty | Label | XP |
| --- | --- | --- |
| 1 | Easy | 10 |
| 2 | Medium | 20 |
| 3 | Hard | 30 |
| 4 | Very Hard | 40 |
| 5 | Extreme | 50 |

Profiles start at level 1. XP is cumulative: the model increments the level while total XP is at least `100 × current level`. For example, 100 XP reaches level 2 and 200 XP reaches level 3. Estimated duration does not affect the reward.

## Repository structure

| Path | Purpose |
| --- | --- |
| `taskmaster_backend/manage.py` | Django management commands |
| `taskmaster_backend/taskmaster_backend/settings.py` | Database, authentication, CORS, and Django configuration |
| `taskmaster_backend/tasks/models.py` | Tasks, profiles, XP, and levels |
| `taskmaster_backend/tasks/views.py` | Task operations, signup, profile, and rankings |
| `taskmaster_backend/tasks/urls.py` | API routes |
| `taskmaster_backend/tasks/signals.py` | Automatically create profiles for new users |
| `taskmaster_frontend/public/manifest.json` | Manifest V3 extension configuration |
| `taskmaster_frontend/public/popup.html` | Popup interface |
| `taskmaster_frontend/public/auth.js` | Login, logout, and token refresh |
| `taskmaster_frontend/public/tasks.js` | Task display and API operations |
| `taskmaster_frontend/public/signup.js` | Registration requests |
| `taskmaster_frontend/public/ranking.js` | Leaderboard interface |
| `taskmaster_frontend/public/ui.js` | Login state and interface helpers |
| `taskmaster_frontend/src/` | Separate, incomplete React scaffold |

## Local installation

### 1. Get the source

```bash
git clone https://github.com/ShacMuSe/Chrome-extension-TaskMaster.git
cd Chrome-extension-TaskMaster
```

Alternatively, extract the repository ZIP and open its root folder.

### 2. Set up the backend

Python 3.12 is a reasonable starting point: the archive contains Python 3.12 bytecode, and the Django project was generated with Django 5.1.3. No backend requirements file or fully pinned environment is included.

```bash
cd taskmaster_backend
python -m venv .venv
```

Activate on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Or on Linux/macOS:

```bash
source .venv/bin/activate
```

Install the packages referenced by the source:

```bash
python -m pip install Django==5.1.3 djangorestframework djangorestframework-simplejwt django-cors-headers
```

Then initialize the database and start Django:

```bash
python manage.py migrate
python manage.py runserver
```

The API is expected at `http://localhost:8000/`. Keep this terminal running while using the extension.

### 3. Load the Chrome extension

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select **`taskmaster_frontend/public/`**, which contains `manifest.json`.
5. Note the extension ID shown by Chrome.
6. In `taskmaster_backend/taskmaster_backend/settings.py`, replace the hard-coded extension origin in `CORS_ALLOWED_ORIGINS` with your own:

   ```python
   CORS_ALLOWED_ORIGINS = [
       'http://localhost:3000',
       'chrome-extension://YOUR_EXTENSION_ID',
   ]
   ```

7. Restart Django if needed, pin TaskMaster, and open the popup.

The plain-JavaScript popup can be loaded directly; **Node.js and an npm build are not required for this route**.

### 4. Use TaskMaster

1. Choose **Sign Up** and create an account.
2. Log in with your username and password.
3. Add a title, description, difficulty from 1 to 5, and duration in minutes.
4. Mark a task complete to receive XP.
5. Edit or delete tasks, or undo completion when needed.
6. Open **TOP 3** to view the leaderboard.

## API reference

Base URL: `http://localhost:8000`

| Method | Endpoint | Purpose | Authentication |
| --- | --- | --- | --- |
| POST | `/api/signup/` | Register with username, email, and password | Public |
| POST | `/api/token/` | Obtain access and refresh tokens | Username/password |
| POST | `/api/token/refresh/` | Refresh an access token | Refresh token |
| GET, POST | `/api/tasks/` | List your tasks or create a task | Bearer token |
| GET, PUT, PATCH, DELETE | `/api/tasks/{id}/` | Retrieve, update, or delete your task | Bearer token |
| POST | `/api/tasks/{id}/toggle/` | Toggle completion and adjust XP | Bearer token |
| GET | `/api/user-profile/` | Get username, level, XP, and rank | Bearer token |
| GET | `/api/rankings/` | Get the top three users | Bearer token |

Authenticated requests use:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Example task creation body:

```json
{
  "title": "Finish portfolio project",
  "description": "Add screenshots and document the setup",
  "difficulty": 3,
  "estimated_duration": 60
}
```

## Configuration

- **API address:** hard-coded in the popup scripts under `public/`.
- **Allowed API host:** `host_permissions` in `public/manifest.json`.
- **Allowed frontend origins:** `CORS_ALLOWED_ORIGINS` in Django settings.
- **Database:** SQLite, configured in Django settings.

If the backend address changes, update the fetch URLs and manifest host permissions together, plus the backend host/origin settings as required.
