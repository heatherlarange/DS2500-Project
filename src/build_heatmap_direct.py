import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
import pandas as pd
import numpy as np
from sklearn.neighbors import KNeighborsClassifier

df = pd.read_csv("data/freekicks_direct_only.csv")

X = df[["location_x", "location_y"]].values

y = df["is_goal"].values

k = 20
knn = KNeighborsClassifier(
    n_neighbors=k,
    weights="distance"
)

knn.fit(X,y)

x = np.linspace(60, 120, 300)
y = np.linspace(0, 80, 300)

xx, yy = np.meshgrid(x,y)

gridpoints = np.c_[xx.ravel(), yy.ravel()]

prob = knn.predict_proba(gridpoints)[:, 1]
prob = prob.reshape(xx.shape)

fig, ax = plt.subplots(figsize=(10,7))

heatmap = ax.imshow(
    prob.T,
    extent=[0,80,60,120],
    origin="lower",
    cmap=LinearSegmentedColormap.from_list(
    "goal_prob", ["#1a9850", "#fee08b", "#d73027"]
),
    alpha=0.85,
    aspect="auto",
    vmin=0, vmax=max(0.5, prob.max())
)

cbar = fig.colorbar(heatmap, ax=ax, shrink=0.8)
cbar.set_label("Predicted Probability of Goal")

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
ax.set_title(f"Goal Probability Heatmap (KNN, k={k})", fontsize=13)
ax.set_xlabel("Location X")
ax.set_ylabel("Location Y")

plt.tight_layout()
plt.savefig("knn_goal_heatmap.png", dpi=200)
plt.show()