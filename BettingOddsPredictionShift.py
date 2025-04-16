import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from scipy import stats

def remove_outliers(df, threshold=1):
    if df['point'].std() == 0: z_scores_point = np.zeros(len(df))
    else: z_scores_point = np.abs(stats.zscore(df['point']))
    mask = (z_scores_point < threshold)
    return df[mask]

def get_coefficients(df, degree):
    return np.polyfit(df.index, df['mean'], degree)

def set_pivot(df):
    # df = df.iloc[1:-1]
    pivot_point = [np.mean(df.index), df["mean"].mean()]    
    plt.scatter(pivot_point[0], pivot_point[1], marker='o', facecolor='none', edgecolor='red')
    return pivot_point

def pivot(coeffs, step):
    coeffs[0] += step
    return coeffs
    
def max_derivative(coeffs, min, max):
    der = np.polyder(coeffs)
    point = np.linspace(min, max, 1000)
    fit = np.poly1d(der)
    return np.max(fit(point))

def plot_fit(coeffs, min, max):
    point = np.linspace(min, max, 1000)
    fit = np.poly1d(coeffs)

    plt.plot(point, fit(point))
    plt.xlabel("Money Line", fontweight="bold")
    plt.ylabel("Odds", fontweight="bold")

def plot_mean(df):
    plt.scatter(df.index, df['mean'], marker='x')

def get_line(coeffs):
    coeffs = coeffs.copy()
    coeffs[-1] += 100
    line = np.roots(coeffs)
    line = line[np.isreal(line)].real
    return line

def plot_line(coeffs, min, max, line):
    point = np.linspace(min, max, 1000)
    fit = np.poly1d(coeffs)

    price = fit(point)

    point_below = point[point < line]
    price_below = fit(point_below) + 200

    point_above = point[point >= line]
    price_above = fit(point_above)

    price = np.concat([price_below, price_above])
    plt.plot(point, price, label="Under")
    plt.plot(point, -price, label="Over")
    plt.legend()

def get_params(path, plot=True):
    odds = pd.read_csv(path)
    print(odds["point"].median(), odds["price"].median())
    # avg_odds = odds.groupby('point')['price'].agg(['mean', 'std'])
    # print(avg_odds)

def std_cubic(path):
    odds = pd.read_csv(path)
    median_point = odds["point"].median()
    
    x_std = [-50, -1, 1, 50]
    y_std = [1000, -99, -101, -1000]
    
    coeffs_std = np.polyfit(x_std, y_std, 3)
    a, b, c, d = coeffs_std
    print(f"Original coefficients: {coeffs_std}")

    new_a = a
    new_b = b - 3*a*median_point
    new_c = c + 3*a*median_point**2 - 2*b*median_point
    new_d = d - a*median_point**3 + b*median_point**2 - c*median_point
    
    # Create function for translated cubic
    coeffs_translated = [new_a, new_b, new_c, new_d]
    fit_translated = np.poly1d(coeffs_translated)
    print(f"Translated coefficients: {coeffs_translated}")
    
    # Plot translated cubic
    x_fit_trans = np.linspace(median_point - 50, median_point + 50, 1000)
    y_fit_trans = fit_translated(x_fit_trans)
    plt.plot(x_fit_trans, y_fit_trans)
    plt.scatter(odds["point"], odds["price"])
    plt.show()
    
    plot_line(coeffs_translated, median_point - 50, median_point + 50, median_point)
    plt.show()
    
    return median_point

path = '/Users/josh/Documents/2024-5 Spring/available_lines_rows.csv'
# get_params(path)
print(std_cubic(path))