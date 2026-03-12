# 🗺️ RouteGraph — Bangalore Routing Engine

> High-performance routing engine for Bangalore's road network using an
in-memory graph and an optimized A* pathfinding implementation.
---

## 📂 Screenshot
Example route computed by the A* engine.

<img width="1918" height="898" alt="image" src="https://github.com/user-attachments/assets/91f8d986-8dfb-4fda-94d3-b788951fe7be" />


## ⚡ Performance

| Method | Heuristic | Avg. Latency | Nodes Visited |
|---|---|---|---|
| Postgres Spatial Query | None (Dijkstra) | ~4,500 ms | 50,000+ |
| In-Memory A\* | Haversine | ~85 ms | ~1,200 |

---

## 🔧 Optimization Journey

**1. Dijkstra → A\***
- Dijkstra expands uniformly in all directions — no concept of destination proximity
- A\* adds heuristic `f(n) = g(n) + h(n)` where `h(n)` is Haversine distance to goal
- Directs search toward destination, cutting nodes visited by ~70%

**2. DB → In-Memory Graph**
- Every neighbor lookup previously fired a round-trip Neon Postgres query
- 400k+ edges now loaded into a `JavaScript Map` at startup; all runtime lookups hit RAM
- Eliminated disk I/O entirely from the hot path

**3. Array → Binary Min-Heap**
- Default array + sort approach: `O(n log n)` per extraction
- Custom `minHeap.js` keeps min-cost node at root: `O(log n)` extraction
- Compounds across every iteration on a 400k-edge graph

---

## 🛠️ Tech Stack

**Backend:** Node.js, Express.js, PostgreSQL (Neon)  
**Frontend:** React (Vite), Tailwind CSS v4, Leaflet.js  
**Algorithm:** A\* with custom Binary Min-Heap

---

## 📂 Structure

```
├── backend
│   ├── services/
│   │   ├── aStar.js           # A* routing logic
│   │   └── graph.service.js   # Graph loading & memory management
│   └── utils/
│       └── minHeap.js         # Binary Min-Heap implementation
└── frontend/src/
    ├── App.jsx
    └── index.css
```

---

## 🔮 Future Roadmap

### 🔍 Search & Landmarks (Next Priority)

- **Location Search:** Integrate a geocoding API (e.g., Nominatim / Mapbox) so users can type place names instead of clicking coordinates.
- **Landmark Nodes:** Pre-index named landmarks (Metro stations, hospitals, colleges, malls) as special nodes in the graph for one-click routing to popular destinations.
- **Autocomplete:** Real-time search suggestions as users type, powered by a trie or prefix index over landmark names.

---

_Built with Node.js, PostgreSQL, React, and Leaflet.js — optimized for Bangalore's road network._
