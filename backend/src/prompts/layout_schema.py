LAYOUT_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "units": {"type": "STRING"},
        "room": {
            "type": "OBJECT",
            "properties": {
                "w": {"type": "NUMBER"},
                "d": {"type": "NUMBER"},
                "h": {"type": "NUMBER"},
                "floorColor": {"type": "STRING"},
            },
            "required": ["w", "d", "h"],
        },
        "anchors": {
            "type": "OBJECT",
            "properties": {
                "pillar": {
                    "type": "OBJECT",
                    "properties": {
                        "wall": {"type": "STRING"},
                        "x": {"type": "NUMBER"},
                        "z": {"type": "NUMBER"},
                        "w": {"type": "NUMBER"},
                        "confidence": {"type": "NUMBER"},
                    },
                },
            },
        },
        "objects": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "id": {"type": "STRING"},
                    "type": {"type": "STRING"},
                    "variant": {"type": "STRING"},
                    "shape": {"type": "STRING"},
                    "color": {"type": "STRING"},
                    "length_m": {"type": "NUMBER"},
                    "pos": {
                        "type": "OBJECT",
                        "properties": {
                            "x": {"type": "NUMBER"},
                            "z": {"type": "NUMBER"},
                        },
                        "required": ["x", "z"],
                    },
                    "yaw_deg": {"type": "NUMBER"},
                    "confidence": {"type": "NUMBER"},
                    "headboard": {"type": "BOOLEAN"},
                    "frame": {"type": "STRING"},
                    "underbedClearance_m": {"type": "NUMBER"},
                },
                "required": ["id", "type", "pos", "yaw_deg", "confidence"],
            },
        },
        "assumptions": {"type": "ARRAY", "items": {"type": "STRING"}},
    },
    "required": ["units", "room", "objects", "assumptions"],
}
