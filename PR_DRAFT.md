PR Title: feat(realtime): add Yjs collaborative prototype (frontend)

Summary:
This PR adds a minimal collaborative editor prototype using Yjs and y-websocket:

- `src/pages/YjsCollaborative.jsx` — a simple textarea bound to a shared `Y.Text` via `y-websocket` provider. Connects to `ws://localhost:6001` by default.
- Added dependencies: `yjs` and `y-websocket` in `package.json`.

Why:
- Proof-of-concept for real-time collaborative editing and presence. Works with the `backend/yjs-server` added in the backend repo.

What to review:
- Simple UX and textarea-based CRDT sync.
- Recommendations for adding cursors, awareness UI, and CodeMirror integration.

Testing Steps:
1. Run the backend Yjs server: `cd backend/yjs-server && npm install && npm start` (or rely on the CI job).
2. Run the frontend: `npm run dev` and open `/collab`.

Open PR URL (suggested):
https://github.com/Nashid-k/prephub-frontend/pull/new/feat/realtime-socket-code-runner
