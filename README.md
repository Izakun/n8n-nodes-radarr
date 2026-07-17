<img src="nodes/Radarr/radarr.svg" width="90" align="right" alt="Radarr" />

# n8n-nodes-radarr

[![npm version](https://img.shields.io/npm/v/n8n-nodes-radarr.svg)](https://www.npmjs.com/package/n8n-nodes-radarr)
[![License: MIT](https://img.shields.io/npm/l/n8n-nodes-radarr.svg)](./LICENSE)

Community node for n8n to manage a [Radarr](https://radarr.video/) movie library through
its **v3 API**.

## Installation

In n8n: **Settings → Community Nodes → Install** and enter `n8n-nodes-radarr`.

## Resources & operations

| Resource | Operations |
|---|---|
| **Movie** | Get Many, Get, Search (lookup), Add, Delete |
| **Queue** | Get Many |
| **Command** | Trigger (e.g. `MoviesSearch`, `RefreshMovie`, `RssSync`) |
| **Calendar** | Get |
| **System** | Get Status, Get Health |

**Add** looks the movie up by its TMDB ID, then adds it with the given quality profile,
root folder and options (monitored, search on add, minimum availability).

## Credentials

Create a **Radarr API** credential:
- **Base URL** — e.g. `http://radarr:7878`.
- **API Key** — Radarr → Settings → General → Security → API Key. Sent as `X-Api-Key`.

## Build

```bash
npm install --ignore-scripts
npm run build
```

## Usage example

List movies in the library:

1. Add the node after a trigger (e.g. *When clicking 'Test workflow'*).
2. Select your credential.
3. Resource **Movie** → **Get Many**.
4. Execute the node — example output:

```json
{ "id": 1, "title": "Inception", "year": 2010, "hasFile": true, "monitored": true }
```

## Disclaimer

This project isn't affiliated with or endorsed by the Radarr project. Radarr is the
property of its respective authors.
