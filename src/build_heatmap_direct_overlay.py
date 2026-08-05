import pandas as pd
import numpy as np
from sklearn.neighbors import KNeighborsRegressor
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap

df = pd.read_csv("data/freekicks_direct_only.csv").dropna(subset=["location_x", "location_y", "is_goal"])
X = df[["location_x", "location_y"]].values
y = df["is_goal"].astype(float).values.ravel()

k = 25
knn = KNeighborsRegressor(n_neighbors=k, weights="distance")
knn.fit(X, y)

x_min, x_max = 60, 120 
y_min, y_max = 0, 80     
grid_res = 300

xx, yy = np.meshgrid(
    np.linspace(x_min, x_max, grid_res),
    np.linspace(y_min, y_max, grid_res)
)
grid_points = np.c_[xx.ravel(), yy.ravel()]
zz = np.asarray(knn.predict(grid_points)).reshape(xx.shape)

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
    zz.T,
    extent=(y_min, y_max, x_min, x_max),
    origin="lower",
    cmap=cmap,
    alpha=0.85,
    aspect="auto",
    vmin=0, vmax=max(0.5, zz.max())
)

plt.savefig(
    "heatmap_overlay.png",
    transparent=True,      
    bbox_inches="tight",   
    pad_inches=0
)
plt.close()

print("Saved clean heatmap_overlay.png")