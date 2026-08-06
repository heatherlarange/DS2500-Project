import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
from scipy.stats import gaussian_kde

df = pd.read_csv("data/freekicks_indirect_fkspot.csv")

goals = df[df["is_goal"] == 1]

x_goals = goals["location_x"].values
y_goals = goals["location_y"].values

kde = gaussian_kde(np.vstack([x_goals, y_goals]), bw_method=0.15)

x_min, x_max = 60, 120 
y_min, y_max = 0, 80     
grid_res = 300

x_grid = np.linspace(60, 120, 300)
y_grid = np.linspace(0, 80, 300)
xx, yy = np.meshgrid(x_grid,y_grid)
gridpoints = np.vstack([xx.ravel(), yy.ravel()])

density = kde(gridpoints)
density = density.reshape(xx.shape)
density_scaled = density * len(x_goals)

cmap = LinearSegmentedColormap.from_list("goal_prob", ["#1a9850", "#fee08b", "#d73027"])

fig = plt.figure(figsize=(10, 7), dpi=150)
fig.patch.set_alpha(0.0)                      

line_color = "white"   
line_width = 1.5

ax = plt.Axes(fig, [0, 0, 1, 1])              
ax.set_axis_off()
ax.patch.set_alpha(0.0)                       
fig.add_axes(ax)

ax.imshow(
    density_scaled.T,
    extent=(y_min, y_max, x_min, x_max),
    origin="lower",
    cmap=cmap,
    alpha=0.85,
    aspect="auto",
    vmin=0, vmax=max(0.5, density_scaled.max())
)

plt.savefig(
    "density_goal_heatmap_overlay_in.png",
    transparent=True,      
    bbox_inches="tight",   
    pad_inches=0
)
plt.close()

print("Saved clean heatmap_overlay.png")