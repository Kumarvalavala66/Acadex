# Settings implementation

## 1. Frontend files

Copy:
- `Settings.jsx` -> `frontend/src/pages/Settings.jsx`
- `Settings.css` -> `frontend/src/pages/Settings.css`

Add the three functions from `api_additions.js` to the bottom of `frontend/src/services/api.js`.

## 2. Backend

Open `backend/app/routers/auth.py`.

Add:
- `from pydantic import BaseModel, Field`
- the `ProfileUpdate` and `PasswordChange` classes
- the three endpoints from `settings_router_additions.py`

`get_current_user`, `verify_password`, and `hash_password` are already part of the existing auth/security setup described in the project.

## 3. Settings route

In `frontend/src/App.jsx`, import:

```jsx
import Settings from "./pages/Settings";
```

Where the existing page switch/router renders the Settings placeholder, replace it with:

```jsx
<Settings user={user} onLogout={handleLogout} />
```

If your app uses a pathname switch rather than a router, use the same branch that currently renders the Settings placeholder.

## 4. Logout handler

If App already has a logout handler, pass it through as `onLogout={handleLogout}`.

If not, use:

```jsx
function handleLogout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("current_user");
  setUser(null);
  setCurrentPage("login");
}
```

Use your existing state/navigation names if they differ.

## 5. Sidebar

Keep the existing fixed sidebar item:

```text
Settings
```

Only change its page target if it still points to the old placeholder.

## 6. Verify

Restart FastAPI if needed, then run the frontend.

Test:
1. Open Settings.
2. Change name -> Save profile.
3. Change username -> Save profile.
4. Change password with the current password.
5. Save academic preferences.
6. Log out and log back in.
7. Confirm profile changes persist.
