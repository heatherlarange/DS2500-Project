import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from sklearn.neighbors import KNeighborsClassifier

df = pd.read_csv("freekicks_all.csv")

X = df[["x", "y"]]

y = df["goal"]

plt.figure(figsize=(10,8))
plt.hist2d(
    goals["location_x"],
    goals["location_y"],
    bins=5,
    cmap="Reds"
)

plt.colorbar(label="Goals")

plt.xlabel("Field X")
plt.ylabel("Field Y")
plt.title("Free Kick Heatmap")

plt.show()

