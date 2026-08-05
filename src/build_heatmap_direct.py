import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
import pandas as pd
import numpy as np
from scipy.stats import gaussian_kde

df = pd.read_csv("data/freekicks_direct_only.csv")

goals = df[df["is_goal"] == 1]

x_goals = goals["location_x"].values
y_goals = goals["location_y"].values

kde = gaussian_kde(np.vstack([x_goals, y_goals]), bw_method=0.15)

x_grid = np.linspace(60, 120, 300)
y_grid = np.linspace(0, 80, 300)
xx, yy = np.meshgrid(x_grid,y_grid)
gridpoints = np.vstack([xx.ravel(), yy.ravel()])

density = kde(gridpoints)
density = density.reshape(xx.shape)
density_scaled = density * len(x_goals)

fig, ax = plt.subplots(figsize=(10,7))

heatmap = ax.imshow(
    density_scaled.T,
    extent=[0,80,60,120],
    origin="lower",
    cmap=LinearSegmentedColormap.from_list(
    "goal_prob", ["#1a9850", "#fee08b", "#d73027"]
),
    alpha=0.85,
    aspect="auto",
    vmin=0, vmax=max(0.5, density_scaled.max())
)

cbar = fig.colorbar(heatmap, ax=ax, shrink=0.8)
cbar.set_label("Density of Direct Goals Scored")

line_color = "black"
line_width = 1.5

ax.plot([0, 80], [120, 120], color="black", lw=1.5)          
ax.plot([18, 62], [102, 102], color="black", lw=1)            
ax.plot([18, 18], [102, 120], color="black", lw=1)
ax.plot([62, 62], [102, 120], color="black", lw=1)
ax.plot([30, 50], [114, 114], color="black", lw=1)            
ax.plot([30, 30], [114, 120], color="black", lw=1)
ax.plot([50, 50], [114, 120], color="black", lw=1)

ax.plot(40, 108, marker="o", markersize=3, color=line_color)

ax.set_xlim(0, 80)
ax.set_ylim(60, 120)
ax.set_title(f"Heatmap of Direct Goal Density", fontsize=13)
ax.set_xlabel("Location X")
ax.set_ylabel("Location Y")

plt.tight_layout()
plt.savefig("density_goal_heatmap.png", dpi=200)
plt.show()