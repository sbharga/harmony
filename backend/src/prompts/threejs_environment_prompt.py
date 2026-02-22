THREEJS_ENVIRONMENT_PROMPT = """Return ONLY JSON (no prose). Schema:
{
  "units": "m",
  "room": { "w": number, "d": number, "h": number, "floorColor"?: string|number },
  "anchors"?: {
    "pillar"?: { "wall"?: "left"|"right"|"back"|"front"|null, "x"?:number, "z"?:number, "w"?:number },
    "door"?: { "wall": "left"|"right"|"back"|"front", "x"?:number, "z"?:number, "w"?:number }
  },
  "objects": [
    { "id": string, "type": string, "variant"?: string,
      "pos": { "x": number, "z": number }, "yaw_deg": number,
      "color"?: string|number,
      "shape"?: "rect"|"round",
      "headboard"?: boolean, "frame"?: string, "underbedClearance_m"?: number,
      "confidence"?: number
    }
  ],
  "assumptions": [string]
}

Types (type + variant):
- seat: office | accent | dining | stool | bench | ottoman
- sofa: loveseat | sofa3 | sectionalL | futon
- bed: twin | full | queen | king | daybed | loft | bunk | mattress_floor
- table: desk | nightstand | vanity | coffee | side | dining | console | high
- storageUnit: dresser_low | dresser_tall | wardrobe | closet_rack | hamper | bookshelf | cube | cabinet | sideboard | shoe_rack
- pillar: (no variant)
- unknownObstacle (shape rect|round, variant null)

Rules:
- Do NOT invent sizes; host uses presets. Copy pos and yaw_deg verbatim.
- Preserve anchors as provided; include door only if already present in input (do not invent one).
- CHAIR FACING (important): For type="seat" objects, determine which wall direction they face based on the image: facing_front (toward camera/front wall), facing_back (away from camera/back wall), facing_left (toward left wall), or facing_right (toward right wall). Chairs should face toward the table they are around. Map to yaw_deg: facing_front=0, facing_right=90, facing_back=180, facing_left=270.
- For non-seat furniture (sofa/bed/table/storageUnit): yaw_deg = 0 faces +Z (toward camera/front wall), 90 faces +X (right wall), 180 faces -Z (back wall), 270 faces -X (left wall). Use this when setting yaw.
- Ignore windows; glass walls count as walls. Pillars only if clearly visible.
- Host always shows floor + back wall; left/right wall only if anchors.pillar.wall or anchors.door.wall is left/right; never add a front wall or ceiling.
- Orientation: forward +Z, right +X, up +Y. yaw_deg rotates about +Y; for rectangular items use yaw_deg to point the LONG side correctly (do not swap dimensions).
- Keep output compact valid JSON only."""
