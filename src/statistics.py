import matplotlib.pyplot as plt
import pandas as pd

df = pd.read_csv("data/freekicks_direct_only.csv")

# Histograms of distance to goal (total and successful)
distance = df["distance_to_goal_m"]
distance_list = distance.tolist()

def histogram_with_num_bins_distance(b):
    plt.figure(figsize=(8, 5))
    plt.hist(distance_list, bins=b, color='skyblue', edgecolor='black')
    plt.title('Histogram of Direct Free Kick Distances', fontsize=14)
    plt.xlabel('Distance', fontsize=12)
    plt.ylabel('Frequency', fontsize=12)
    plt.tight_layout()
    plt.show()

histogram_with_num_bins_distance(50)

goals = df[df["is_goal"] == 1]
distance_goal = goals["distance_to_goal_m"]
distance_goal_list = distance_goal.tolist()

def histogram_with_num_bins_distance_goal(b):
    plt.figure(figsize=(8, 5))
    plt.hist(distance_goal_list, bins=b, color='skyblue', edgecolor='black')
    plt.title('Histogram of Successful Direct Free Kick Distances', fontsize=14)
    plt.xlabel('Distance', fontsize=12)
    plt.ylabel('Frequency', fontsize=12)
    plt.tight_layout()
    plt.show()

histogram_with_num_bins_distance_goal(15)

# Histograms of shot angle (total and successful)

shot_angle = df["shot_angle_deg"]
shot_angle_list = shot_angle.tolist()

def histogram_with_num_bins_shot_angle(b):
    plt.figure(figsize=(8, 5))
    plt.hist(shot_angle_list, bins=b, color='skyblue', edgecolor='black')
    plt.title('Histogram of Direct Free Kick Shot Angles', fontsize=14)
    plt.xlabel('Distance', fontsize=12)
    plt.ylabel('Frequency', fontsize=12)
    plt.tight_layout()
    plt.show()

histogram_with_num_bins_shot_angle(50)

shot_angle_goal = goals["shot_angle_deg"]
shot_angle_goal_list = shot_angle_goal.tolist()

def histogram_with_num_bins_shot_angle_goal(b):
    plt.figure(figsize=(8, 5))
    plt.hist(shot_angle_goal_list, bins=b, color='skyblue', edgecolor='black')
    plt.title('Histogram of Successful Direct Free Kick Shot Angles', fontsize=14)
    plt.xlabel('Distance', fontsize=12)
    plt.ylabel('Frequency', fontsize=12)
    plt.tight_layout()
    plt.show()

histogram_with_num_bins_shot_angle_goal(15)

# Boxplot of successful free kick distance (direct vs indirect)


# Boxplot of successful free kick shot angle (left foot vs right foot) for both direct and indrect