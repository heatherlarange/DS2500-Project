# Data

The cleaned dataset ships as two files, one per free-kick type. Both share the
same 18 columns, so they can be concatenated.

## `freekicks_direct_only.csv`

Shots taken straight from the free kick. **3,846 rows**, 246 goals (6.4%).

## `freekicks_indirect_only.csv`

Shots created by a free-kick delivery. **12,092 rows**, 1,222 goals (10.1%).

Combined that is **15,938 free-kick shots**, drawn from HuggingFace xG shot data
and StatsBomb Open Data across 17 competitions.

### Columns used by the map

The interactive map keys off these:

| Column | Meaning |
|---|---|
| `location_x`, `location_y` | shot position on the StatsBomb 120x80 pitch |
| `is_goal` | 1 if the free kick was scored, else 0 (the target variable) |
| `player` | shooter name |
| `competition` | league or tournament |
| `distance_to_goal_m`, `shot_angle_deg` | precomputed geometry (the app also computes these live) |

The other columns are `shot_id`, `match_id`, `season`, `team`, `period`,
`game_time`, `y_from_center`, `body_part`, `free_kick_type`,
`player_fk_attempts`, and `xg`.

A handful of rows fall outside the attacking half and are skipped by the map,
which is coordinate-based: 15,917 of the 15,938 shots are plotted.
