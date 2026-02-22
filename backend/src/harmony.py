"""
Python port of testing/harmonysimulation-claude/src/preview/harmony.js
Harmony scorer and greedy optimizer for room layouts.
"""

import math
import json
import random
import copy

DEG2RAD = math.pi / 180

PRESETS = {
    "seat": {
        "office":  {"w": 0.6,  "d": 0.6},
        "accent":  {"w": 0.6,  "d": 0.65},
        "dining":  {"w": 0.48, "d": 0.52},
        "stool":   {"w": 0.4,  "d": 0.4},
        "bench":   {"w": 1.1,  "d": 0.42},
        "ottoman": {"w": 0.6,  "d": 0.6},
    },
    "sofa": {
        "loveseat":  {"w": 1.6, "d": 0.9},
        "sofa3":     {"w": 2.1, "d": 0.95},
        "sectionalL":{"w": 2.6, "d": 2.0},
        "futon":     {"w": 1.9, "d": 0.9},
    },
    "bed": {
        "twin":          {"w": 0.99, "d": 1.9},
        "full":          {"w": 1.37, "d": 1.9},
        "queen":         {"w": 1.52, "d": 2.03},
        "king":          {"w": 1.93, "d": 2.03},
        "daybed":        {"w": 0.99, "d": 2.0},
        "loft":          {"w": 0.99, "d": 1.9},
        "bunk":          {"w": 0.99, "d": 1.9},
        "mattress_floor":{"w": 1.52, "d": 2.03},
    },
    "table": {
        "desk":      {"w": 1.4,  "d": 0.7},
        "nightstand":{"w": 0.55, "d": 0.45},
        "vanity":    {"w": 1.0,  "d": 0.45},
        "coffee":    {"w": 1.0,  "d": 0.6},
        "side":      {"w": 0.5,  "d": 0.5},
        "dining":    {"w": 1.6,  "d": 0.9},
        "console":   {"w": 1.2,  "d": 0.35},
        "high":      {"w": 0.7,  "d": 0.7},
    },
    "storageunit": {
        "dresser_low":  {"w": 1.2, "d": 0.45},
        "dresser_tall": {"w": 1.0, "d": 0.5},
        "wardrobe":     {"w": 1.4, "d": 0.6},
        "closet_rack":  {"w": 1.2, "d": 0.45},
        "hamper":       {"w": 0.45,"d": 0.45},
        "bookshelf":    {"w": 0.9, "d": 0.35},
        "cube":         {"w": 0.8, "d": 0.35},
        "cabinet":      {"w": 1.0, "d": 0.45},
        "sideboard":    {"w": 1.5, "d": 0.45},
        "shoe_rack":    {"w": 0.8, "d": 0.35},
    },
    "pillar": {
        "pillar":  {"w": 0.35, "d": 0.35},
    },
    "unknownobstacle": {
        "default": {"w": 0.6, "d": 0.6},
    },
}

# ── Footprint helpers ──────────────────────────────────────────────────────────

def _dims_for(item):
    t = (item.get("type") or "unknownobstacle").lower()
    v = item.get("variant") or "default"
    family = PRESETS.get(t) or PRESETS["unknownobstacle"]
    dims = family.get(v) or family.get("default") or {"w": 0.6, "d": 0.6}
    yaw = ((item.get("yaw_deg") or 0) % 360 + 360) % 360
    if abs(((yaw + 45) % 180) - 90) < 1e-3:
        return {"w": dims["d"], "d": dims["w"]}
    return dims


def _rect_from_item(item):
    dims = _dims_for(item)
    yaw = ((item.get("yaw_deg") or 0) % 360 + 360) % 360
    pos = item.get("pos") or {}
    return {
        "cx": pos.get("x") or 0.0,
        "cz": pos.get("z") or 0.0,
        "w": dims["w"],
        "d": dims["d"],
        "yaw": yaw,
    }


def _point_rect_dist(px, pz, rect):
    rad = rect["yaw"] * DEG2RAD
    cos = math.cos(rad)
    sin = math.sin(rad)
    dx = px - rect["cx"]
    dz = pz - rect["cz"]
    lx = dx * cos + dz * sin
    lz = -dx * sin + dz * cos
    ax = abs(lx) - rect["w"] / 2
    az = abs(lz) - rect["d"] / 2
    if ax <= 0 and az <= 0:
        return 0.0
    return math.hypot(max(ax, 0), max(az, 0))


def _rect_intersection_area(a, b):
    ax1 = a["cx"] - a["w"] / 2;  ax2 = a["cx"] + a["w"] / 2
    az1 = a["cz"] - a["d"] / 2;  az2 = a["cz"] + a["d"] / 2
    bx1 = b["cx"] - b["w"] / 2;  bx2 = b["cx"] + b["w"] / 2
    bz1 = b["cz"] - b["d"] / 2;  bz2 = b["cz"] + b["d"] / 2
    ix = max(0.0, min(ax2, bx2) - max(ax1, bx1))
    iz = max(0.0, min(az2, bz2) - max(az1, bz1))
    return ix * iz


def _clearance(a, b):
    dx = abs(a["cx"] - b["cx"]) - (a["w"] + b["w"]) / 2
    dz = abs(a["cz"] - b["cz"]) - (a["d"] + b["d"]) / 2
    return math.hypot(max(0.0, dx), max(0.0, dz))


def _inside_room(rect, room):
    x1 = rect["cx"] - rect["w"] / 2;  x2 = rect["cx"] + rect["w"] / 2
    z1 = rect["cz"] - rect["d"] / 2;  z2 = rect["cz"] + rect["d"] / 2
    over_x = max(0.0, -x1) + max(0.0, x2 - room["w"])
    over_z = max(0.0, -z1) + max(0.0, z2 - room["d"])
    if over_x == 0 and over_z == 0:
        return 0.0
    return over_x * rect["d"] + over_z * rect["w"]

# ── Grid + pathfinding ─────────────────────────────────────────────────────────

def _build_grid(room, rects, step=0.25):
    cols = math.ceil(room["w"] / step)
    rows = math.ceil(room["d"] / step)
    grid = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            x = c * step + step / 2
            z = r * step + step / 2
            for rect in rects:
                if _point_rect_dist(x, z, rect) == 0:
                    grid[r][c] = 1
                    break
    return {"grid": grid, "rows": rows, "cols": cols, "step": step}


def _in_bounds(r, c, rows, cols):
    return 0 <= r < rows and 0 <= c < cols


def _shortest_path(grid_obj, start, goal):
    rows = grid_obj["rows"]
    cols = grid_obj["cols"]
    step = grid_obj["step"]
    grid = [row[:] for row in grid_obj["grid"]]  # fresh clone

    sr = max(0, min(rows - 1, int(start["z"] / step)))
    sc = max(0, min(cols - 1, int(start["x"] / step)))
    gr = max(0, min(rows - 1, int(goal["z"] / step)))
    gc = max(0, min(cols - 1, int(goal["x"] / step)))

    if grid[sr][sc] == 1 or grid[gr][gc] == 1:
        return None

    from collections import deque
    q = deque([(sr, sc)])
    prev = [[None] * cols for _ in range(rows)]
    deltas = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    grid[sr][sc] = 2

    while q:
        r, c = q.popleft()
        if r == gr and c == gc:
            break
        for dr, dc in deltas:
            nr, nc = r + dr, c + dc
            if not _in_bounds(nr, nc, rows, cols) or grid[nr][nc] != 0:
                continue
            grid[nr][nc] = 2
            prev[nr][nc] = (r, c)
            q.append((nr, nc))

    if prev[gr][gc] is None:
        return None

    path = []
    cur = (gr, gc)
    while cur:
        r, c = cur
        path.append({"x": c * step + step / 2, "z": r * step + step / 2})
        cur = prev[r][c]
    path.reverse()
    return path


def _path_metrics(path, rects):
    if path is None:
        return {"length": float("inf"), "min_clear": 0.0}
    length = 0.0
    for i in range(1, len(path)):
        length += math.hypot(path[i]["x"] - path[i-1]["x"], path[i]["z"] - path[i-1]["z"])
    min_clear = float("inf")
    for p in path:
        dmin = float("inf")
        for rect in rects:
            d = _point_rect_dist(p["x"], p["z"], rect)
            if d < dmin:
                dmin = d
            if dmin == 0:
                break
        if dmin < min_clear:
            min_clear = dmin
    return {"length": length, "min_clear": 0.0 if min_clear == float("inf") else min_clear}

# ── Largest connected open region ─────────────────────────────────────────────

def _largest_open_region(grid_obj):
    rows = grid_obj["rows"]
    cols = grid_obj["cols"]
    grid = grid_obj["grid"]
    visited = [[False] * cols for _ in range(rows)]

    total_open = sum(1 for r in range(rows) for c in range(cols) if grid[r][c] == 0)
    if total_open == 0:
        return 0.0

    from collections import deque
    largest = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != 0 or visited[r][c]:
                continue
            q = deque([(r, c)])
            visited[r][c] = True
            size = 0
            while q:
                cr, cc = q.popleft()
                size += 1
                for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                    nr, nc = cr + dr, cc + dc
                    if not _in_bounds(nr, nc, rows, cols) or visited[nr][nc] or grid[nr][nc] != 0:
                        continue
                    visited[nr][nc] = True
                    q.append((nr, nc))
            if size > largest:
                largest = size

    return largest / total_open

# ── Wall-hug score ─────────────────────────────────────────────────────────────

_WALL_HUG_TYPES = {"bed", "sofa", "storageunit"}
_WALL_HUG_VARIANTS = {"dresser_low", "dresser_tall", "wardrobe", "sideboard", "cabinet"}


def _is_large_item(obj):
    t = (obj.get("type") or "").lower()
    if t in _WALL_HUG_TYPES:
        return True
    if t == "table" and (obj.get("variant") or "") in _WALL_HUG_VARIANTS:
        return True
    return False


def _wall_hug_score(rects, objects, room):
    total = 0.0
    count = 0
    for i, obj in enumerate(objects):
        if not _is_large_item(obj):
            continue
        r = rects[i]
        dist_to_wall = min(r["cx"], room["w"] - r["cx"], r["cz"], room["d"] - r["cz"])
        edge_dist = dist_to_wall - max(r["w"], r["d"]) / 2
        score = max(0.0, 1.0 - max(0.0, edge_dist) / 1.0)
        total += score
        count += 1
    return total / count if count else 1.0

# ── Furniture facing score ─────────────────────────────────────────────────────

def _facing_score(rects, objects, room, anchors):
    cx = room["w"] / 2
    cz = room["d"] / 2
    door = (anchors or {}).get("door") or {}
    door_z = door.get("z") or 0.0
    door_x = door.get("x") or cx

    total = 0.0
    count = 0
    for i, obj in enumerate(objects):
        t = (obj.get("type") or "").lower()
        v = obj.get("variant") or ""
        r = rects[i]
        yaw = r["yaw"] * DEG2RAD
        fwd_x = math.sin(yaw)
        fwd_z = math.cos(yaw)
        score = 0.5  # neutral default

        if t == "sofa":
            to_cx = cx - r["cx"]; to_cz = cz - r["cz"]
            length = math.hypot(to_cx, to_cz) or 1.0
            dot = (fwd_x * to_cx + fwd_z * to_cz) / length
            score = (dot + 1) / 2
        elif t == "bed":
            to_dx = door_x - r["cx"]; to_dz = door_z - r["cz"]
            length = math.hypot(to_dx, to_dz) or 1.0
            dot = (fwd_x * to_dx + fwd_z * to_dz) / length
            score = (dot + 1) / 2
        elif t == "table" and v == "desk":
            dist_n = r["cz"]; dist_s = room["d"] - r["cz"]
            dist_w = r["cx"]; dist_e = room["w"] - r["cx"]
            min_dist = min(dist_n, dist_s, dist_w, dist_e)
            wfx, wfz = 0.0, 0.0
            if min_dist == dist_n:   wfz = -1.0
            elif min_dist == dist_s: wfz =  1.0
            elif min_dist == dist_w: wfx = -1.0
            else:                    wfx =  1.0
            dot = fwd_x * wfx + fwd_z * wfz
            score = (dot + 1) / 2
        else:
            continue

        total += score
        count += 1

    return total / count if count else 1.0

# ── Zone coherence ─────────────────────────────────────────────────────────────

_ZONE_MAP = {"bed": "sleep", "sofa": "lounge"}
_ZONE_VARIANT_MAP = {"desk": "work", "coffee": "lounge", "ottoman": "lounge", "dining": "dining", "high": "dining"}


def _get_zone(obj):
    t = (obj.get("type") or "").lower()
    if t in _ZONE_MAP:
        return _ZONE_MAP[t]
    v = obj.get("variant") or ""
    if v in _ZONE_VARIANT_MAP:
        return _ZONE_VARIANT_MAP[v]
    if t == "seat":
        if v == "dining": return "dining"
        if v == "office": return "work"
    return None


def _zone_cohere_score(rects, objects):
    zones: dict = {}
    for i, obj in enumerate(objects):
        z = _get_zone(obj)
        if not z:
            continue
        zones.setdefault(z, []).append(rects[i])

    zone_keys = [k for k, v in zones.items() if v]
    if len(zone_keys) < 2:
        return 1.0

    centroids = {}
    for k in zone_keys:
        items = zones[k]
        centroids[k] = {
            "x": sum(r["cx"] for r in items) / len(items),
            "z": sum(r["cz"] for r in items) / len(items),
        }

    inter_total = 0.0; inter_count = 0
    for i in range(len(zone_keys)):
        for j in range(i + 1, len(zone_keys)):
            a = centroids[zone_keys[i]]; b = centroids[zone_keys[j]]
            inter_total += math.hypot(a["x"] - b["x"], a["z"] - b["z"])
            inter_count += 1
    avg_inter = inter_total / inter_count if inter_count else 1.0

    intra_total = 0.0; intra_count = 0
    for k in zone_keys:
        items = zones[k]; c = centroids[k]
        for r in items:
            intra_total += math.hypot(r["cx"] - c["x"], r["cz"] - c["z"])
            intra_count += 1
    avg_intra = intra_total / intra_count if intra_count else 0.0

    ratio = avg_inter / (avg_intra + avg_inter + 0.01)
    return max(0.0, min(1.0, ratio * 1.8))

# ── Corridor / clear score ─────────────────────────────────────────────────────

def _clear_score(rects, room, step=0.25):
    r = 0.3; tau = 0.15
    s = 0.0; n = 0
    x = step / 2
    while x <= room["w"]:
        z = step / 2
        while z <= room["d"]:
            n += 1
            dmin = float("inf")
            for rect in rects:
                d = _point_rect_dist(x, z, rect)
                if d < dmin: dmin = d
                if dmin == 0: break
            s += 1.0 / (1.0 + math.exp(-(dmin - r) / tau))
            z += step
        x += step
    return s / n if n else 1.0


def _select_targets(objects):
    picks = []
    checks = [
        lambda o: (o.get("type") or "").lower() == "bed",
        lambda o: (o.get("type") or "").lower() == "table" and o.get("variant") == "desk",
        lambda o: (o.get("type") or "").lower() == "storageunit" and o.get("variant") == "wardrobe",
        lambda o: (o.get("type") or "").lower() == "sofa",
    ]
    for fn in checks:
        obj = next((o for o in objects if fn(o)), None)
        if obj:
            picks.append(obj)
    return picks[:4]

# ── Adjacency bonus ────────────────────────────────────────────────────────────

def _adjacency_bonus(rects, objects):
    pairs = []
    def t(i): return (objects[i].get("type") or "").lower() if i < len(objects) else ""
    def v(i): return (objects[i].get("variant") or "").lower() if i < len(objects) else ""

    def add_pair(i, j, thresh=0.9, bonus=0.02):
        dist = math.hypot(rects[i]["cx"] - rects[j]["cx"], rects[i]["cz"] - rects[j]["cz"])
        if 0 < dist <= thresh:
            pairs.append(bonus)

    for i in range(len(rects)):
        for j in range(i + 1, len(rects)):
            ti, tj, vi, vj = t(i), t(j), v(i), v(j)
            if ti == "bed" and tj == "table" and vj == "nightstand": add_pair(i, j, 0.8, 0.05)
            if tj == "bed" and ti == "table" and vi == "nightstand": add_pair(i, j, 0.8, 0.05)
            if ti == "bed" and tj == "storageunit" and vj in ("dresser_low","dresser_tall"): add_pair(i, j, 1.2, 0.04)
            if tj == "bed" and ti == "storageunit" and vi in ("dresser_low","dresser_tall"): add_pair(i, j, 1.2, 0.04)
            if ti == "sofa" and tj == "seat" and vj == "ottoman": add_pair(i, j, 0.9, 0.05)
            if tj == "sofa" and ti == "seat" and vi == "ottoman": add_pair(i, j, 0.9, 0.05)
            if ti == "sofa" and tj == "table" and vj in ("coffee","side"): add_pair(i, j, 1.0, 0.04)
            if tj == "sofa" and ti == "table" and vi in ("coffee","side"): add_pair(i, j, 1.0, 0.04)
            if ti == "table" and vi == "desk" and tj == "seat": add_pair(i, j, 0.8, 0.05)
            if tj == "table" and vj == "desk" and ti == "seat": add_pair(i, j, 0.8, 0.05)

    return min(0.15, sum(pairs))

# ── Main scorer ────────────────────────────────────────────────────────────────

def compute_harmony(spec: dict) -> float:
    """Return a 0–100 harmony score for the given layout spec."""
    room = spec.get("room") or {}
    if not room.get("w") or not room.get("d"):
        return 0.0

    objects = spec.get("objects") or []
    rects = [_rect_from_item(o) for o in objects]
    A = room["w"] * room["d"]

    base_grid = _build_grid(room, rects, 0.25)

    open_region = _largest_open_region(base_grid)
    clear = _clear_score(rects, room, 0.25)

    anchors = spec.get("anchors") or {}
    door = anchors.get("door") or {}
    door_x = door.get("x") or room["w"] / 2
    door_z = door.get("z") or 0.0
    start = {"x": door_x, "z": door_z + 0.05}
    targets = _select_targets(objects)

    trav_scores = []
    for tgt in targets:
        path = _shortest_path(base_grid, start, {"x": tgt.get("pos", {}).get("x", 0), "z": tgt.get("pos", {}).get("z", 0)})
        m = _path_metrics(path, rects)
        straight = math.hypot(tgt.get("pos", {}).get("x", 0) - start["x"], tgt.get("pos", {}).get("z", 0) - start["z"])
        et = 0.0 if m["length"] == float("inf") else straight / m["length"]
        wnorm = max(0.0, min(1.0, m["min_clear"] / 0.45))
        trav_scores.append(et * wnorm)
    trav = sum(trav_scores) / len(trav_scores) if trav_scores else 0.5

    wall_hug = _wall_hug_score(rects, objects, room)
    facing = _facing_score(rects, objects, room, anchors)
    zone_cohere = _zone_cohere_score(rects, objects)
    adj_bonus = _adjacency_bonus(rects, objects)

    # Penalties
    a_overlap = 0.0
    for i in range(len(rects)):
        for j in range(i + 1, len(rects)):
            a_overlap += _rect_intersection_area(rects[i], rects[j])

    a_oob = sum(_inside_room(r, room) for r in rects)

    door_w = door.get("w") or 0.9
    D = {"cx": door_x, "cz": door_z + 0.45, "w": door_w, "d": 0.9, "yaw": 0.0}
    door_blocked_area = sum(_rect_intersection_area(D, r) for r in rects)
    door_blocked = door_blocked_area / (D["w"] * D["d"]) if D["w"] * D["d"] else 0.0

    cluster_accum = 0.0; pair_count = 0
    for i in range(len(rects)):
        for j in range(i + 1, len(rects)):
            c = _clearance(rects[i], rects[j])
            if c < 0.25:
                cluster_accum += (0.25 - c) / 0.25
            pair_count += 1
    cluster_pen = cluster_accum / pair_count if pair_count else 0.0

    pen = max(0.0, min(1.0, 5 * (a_overlap / A) + 5 * (a_oob / A) + 3 * door_blocked + 0.5 * cluster_pen))

    base = (
        0.20 * open_region
        + 0.15 * clear
        + 0.15 * trav
        + 0.20 * wall_hug
        + 0.15 * facing
        + 0.15 * zone_cohere
        - pen
        + adj_bonus
    )

    return 100.0 * max(0.0, min(1.0, base))

def compute_harmony_breakdown(spec: dict) -> dict:
    """Return harmony score with per-metric breakdown (each value 0–100)."""
    room = spec.get("room") or {}
    _empty = {"score": 0.0, "breakdown": {"open_space": 0.0, "clearance": 0.0, "traversability": 0.0, "wall_placement": 0.0, "orientation": 0.0, "zone_coherence": 0.0}}
    if not room.get("w") or not room.get("d"):
        return _empty

    objects = spec.get("objects") or []
    rects = [_rect_from_item(o) for o in objects]
    A = room["w"] * room["d"]

    base_grid = _build_grid(room, rects, 0.25)

    open_region = _largest_open_region(base_grid)
    clear = _clear_score(rects, room, 0.25)

    anchors = spec.get("anchors") or {}
    door = anchors.get("door") or {}
    door_x = door.get("x") or room["w"] / 2
    door_z = door.get("z") or 0.0
    start = {"x": door_x, "z": door_z + 0.05}
    targets = _select_targets(objects)

    trav_scores = []
    for tgt in targets:
        path = _shortest_path(base_grid, start, {"x": tgt.get("pos", {}).get("x", 0), "z": tgt.get("pos", {}).get("z", 0)})
        m = _path_metrics(path, rects)
        straight = math.hypot(tgt.get("pos", {}).get("x", 0) - start["x"], tgt.get("pos", {}).get("z", 0) - start["z"])
        et = 0.0 if m["length"] == float("inf") else straight / m["length"]
        wnorm = max(0.0, min(1.0, m["min_clear"] / 0.45))
        trav_scores.append(et * wnorm)
    trav = sum(trav_scores) / len(trav_scores) if trav_scores else 0.5

    wall_hug = _wall_hug_score(rects, objects, room)
    facing = _facing_score(rects, objects, room, anchors)
    zone_cohere = _zone_cohere_score(rects, objects)
    adj_bonus = _adjacency_bonus(rects, objects)

    # Penalties
    a_overlap = 0.0
    for i in range(len(rects)):
        for j in range(i + 1, len(rects)):
            a_overlap += _rect_intersection_area(rects[i], rects[j])

    a_oob = sum(_inside_room(r, room) for r in rects)

    door_w = door.get("w") or 0.9
    D = {"cx": door_x, "cz": door_z + 0.45, "w": door_w, "d": 0.9, "yaw": 0.0}
    door_blocked_area = sum(_rect_intersection_area(D, r) for r in rects)
    door_blocked = door_blocked_area / (D["w"] * D["d"]) if D["w"] * D["d"] else 0.0

    cluster_accum = 0.0; pair_count = 0
    for i in range(len(rects)):
        for j in range(i + 1, len(rects)):
            c = _clearance(rects[i], rects[j])
            if c < 0.25:
                cluster_accum += (0.25 - c) / 0.25
            pair_count += 1
    cluster_pen = cluster_accum / pair_count if pair_count else 0.0

    pen = max(0.0, min(1.0, 5 * (a_overlap / A) + 5 * (a_oob / A) + 3 * door_blocked + 0.5 * cluster_pen))

    base = (
        0.20 * open_region
        + 0.15 * clear
        + 0.15 * trav
        + 0.20 * wall_hug
        + 0.15 * facing
        + 0.15 * zone_cohere
        - pen
        + adj_bonus
    )

    total = round(100.0 * max(0.0, min(1.0, base)), 1)
    return {
        "score": total,
        "breakdown": {
            "open_space":     round(open_region * 100, 1),
            "clearance":      round(clear * 100, 1),
            "traversability": round(trav * 100, 1),
            "wall_placement": round(wall_hug * 100, 1),
            "orientation":    round(facing * 100, 1),
            "zone_coherence": round(zone_cohere * 100, 1),
        },
    }

# ── Heatmap generator ──────────────────────────────────────────────────────────

def build_heatmap(spec: dict, step: float = 0.25) -> dict | None:
    if not spec or not spec.get("room"):
        return None
    room = spec["room"]
    objects = spec.get("objects") or []
    rects = [_rect_from_item(o) for o in objects]
    grid_obj = _build_grid(room, rects, step)

    anchors = spec.get("anchors") or {}
    door = anchors.get("door") or {}
    door_x = door.get("x") or room["w"] / 2
    door_z = door.get("z") or 0.0

    from collections import deque
    start_r = max(0, min(grid_obj["rows"] - 1, int((door_z + 0.05) / step)))
    start_c = max(0, min(grid_obj["cols"] - 1, int(door_x / step)))
    reach = [[False] * grid_obj["cols"] for _ in range(grid_obj["rows"])]

    if grid_obj["grid"][start_r][start_c] == 0:
        q = deque([(start_r, start_c)])
        reach[start_r][start_c] = True
        while q:
            r, c = q.popleft()
            for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                nr, nc = r + dr, c + dc
                if not _in_bounds(nr, nc, grid_obj["rows"], grid_obj["cols"]):
                    continue
                if reach[nr][nc] or grid_obj["grid"][nr][nc] != 0:
                    continue
                reach[nr][nc] = True
                q.append((nr, nc))

    cells = []
    for r in range(grid_obj["rows"]):
        row = []
        for c in range(grid_obj["cols"]):
            x = c * step + step / 2
            z = r * step + step / 2
            if grid_obj["grid"][r][c] == 1:
                row.append({"v": 1.0, "occupied": True, "unreachable": False})
                continue
            clearance_min = float("inf")
            for rect in rects:
                d = _point_rect_dist(x, z, rect)
                if d < clearance_min: clearance_min = d
                if clearance_min == 0: break
            clearance_penalty = max(0.0, min(1.0, (0.18 - clearance_min) / 0.18))
            unreachable_penalty = 0.0 if reach[r][c] else 0.7
            row.append({
                "v": max(clearance_penalty, unreachable_penalty),
                "occupied": False,
                "unreachable": not reach[r][c],
            })
        cells.append(row)

    return {
        "cells": cells,
        "rows": grid_obj["rows"],
        "cols": grid_obj["cols"],
        "step": step,
    }

# ── Optimizer ──────────────────────────────────────────────────────────────────

def _wall_candidates(room, dims, step=0.35):
    hw = dims["w"] / 2; hd = dims["d"] / 2
    inset = 0.05
    spots = []

    x = hw + inset
    while x <= room["w"] - hw - inset:
        spots.append({"pos": {"x": x, "z": hd + inset}, "yaw_deg": 180})
        x += step

    x = hw + inset
    while x <= room["w"] - hw - inset:
        spots.append({"pos": {"x": x, "z": room["d"] - hd - inset}, "yaw_deg": 0})
        x += step

    z = hd + inset
    while z <= room["d"] - hd - inset:
        spots.append({"pos": {"x": hw + inset, "z": z}, "yaw_deg": 90})
        z += step

    z = hd + inset
    while z <= room["d"] - hd - inset:
        spots.append({"pos": {"x": room["w"] - hw - inset, "z": z}, "yaw_deg": 270})
        z += step

    return spots


def _interior_candidates(room, step=0.4):
    spots = []
    inset = 0.2
    rotations = [0, 90, 180, 270]
    x = inset
    while x <= room["w"] - inset:
        z = inset
        while z <= room["d"] - inset:
            for yaw in rotations:
                spots.append({"pos": {"x": x, "z": z}, "yaw_deg": yaw})
            z += step
        x += step
    for _ in range(12):
        spots.append({
            "pos": {
                "x": inset + random.random() * (room["w"] - 2 * inset),
                "z": inset + random.random() * (room["d"] - 2 * inset),
            },
            "yaw_deg": random.choice(rotations),
        })
    return spots


def _candidates_for(obj, room):
    if _is_large_item(obj):
        dims = _dims_for(obj)
        return _wall_candidates(room, dims)
    return _interior_candidates(room)


def _is_collision(rect, others):
    for o in others:
        if _rect_intersection_area(rect, o) > 1e-4:
            return True
        if _clearance(rect, o) < 0.12:
            return True
    return False


def optimize_layout(spec: dict, passes: int = 6) -> tuple[dict, float]:
    """
    Greedy hill-climbing optimizer.
    Returns (optimized_spec, harmony_score).
    """
    best_spec = copy.deepcopy(spec)
    best_score = compute_harmony(best_spec)

    for _ in range(passes):
        working = copy.deepcopy(best_spec)
        rects = [_rect_from_item(o) for o in working["objects"]]
        order = list(range(len(rects)))
        random.shuffle(order)
        improved = False

        for idx in order:
            obj = working["objects"][idx]
            if (obj.get("type") or "").lower() == "pillar":
                continue

            candidates = _candidates_for(obj, working["room"])
            best_local_delta = 0.0
            best_local_spec = None

            for cand in candidates:
                test_spec = copy.deepcopy(working)
                test_spec["objects"][idx]["pos"] = dict(cand["pos"])
                test_spec["objects"][idx]["yaw_deg"] = cand["yaw_deg"]
                rect = _rect_from_item(test_spec["objects"][idx])

                # Bounds check
                if (rect["cx"] - rect["w"] / 2 < 0 or
                        rect["cz"] - rect["d"] / 2 < 0 or
                        rect["cx"] + rect["w"] / 2 > working["room"]["w"] or
                        rect["cz"] + rect["d"] / 2 > working["room"]["d"]):
                    continue

                others = [r for ri, r in enumerate(rects) if ri != idx]
                if _is_collision(rect, others):
                    continue

                score = compute_harmony(test_spec)
                delta = score - best_score
                if delta > best_local_delta + 1e-4:
                    best_local_delta = delta
                    best_local_spec = test_spec

            if best_local_spec is not None:
                best_spec = best_local_spec
                best_score = best_score + best_local_delta
                improved = True
                break

        if not improved:
            break

    return best_spec, best_score
