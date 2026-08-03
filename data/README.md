# Data

## `freekicks_all.csv`

Every free-kick shot from three sources, merged into one shared schema (one row
per shot). Overlapping shots are de-duplicated, keeping the richer StatsBomb row.

- **~18,000 shots**, 25 columns.
- Sources: HuggingFace xG shot data and StatsBomb Open Data (Football Events can
  be appended after downloading it from Kaggle).
- Free-kick type is split into `direct` (shot straight from the free kick) and
  `indirect` (a shot off a free-kick delivery).

### Columns used by the map

The interactive map keys off these:

| Column | Meaning |
|---|---|
| `location_x`, `location_y` | shot position on the StatsBomb 120x80 pitch |
| `is_goal` | 1 if the free kick was scored, else 0 |
| `player` | shooter name (StatsBomb rows; HuggingFace rows are anonymized) |
| `competition` | league or tournament |
| `distance_to_goal_m`, `shot_angle_deg` | precomputed geometry (the app also computes these live) |

The full 25-column schema (xG, body part, technique, goalkeeper distance, etc.)
is documented alongside the source CSVs.

Rows without `location_x` / `location_y` (the Football Events source) are skipped
by the map because it is coordinate-based.
