import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import os

paths = []
params = []

for path in paths:
    odds = pd.read_csv(path)
    stats_linear = odds.groupby('Line')['Odds'].agg(['mean', 'std'])
    max_line = stats_linear.index.max() + stats_linear.index.min()
    stats_cubic = pd.concat([pd.DataFrame([[1000, np.nan]], columns=['mean', 'std'], index=[0]), stats_linear])
    stats_cubic = pd.concat([stats_cubic, pd.DataFrame([[-1000, np.nan]], columns=['mean', 'std'], index=[max_line])])

    coeffs = np.polyfit(stats_cubic.index, stats_cubic['mean'], 3) 
    cubic_fit = np.poly1d(coeffs)

    cubic_coeffs = coeffs.copy()
    cubic_coeffs[-1] += 100

    x_at_neg_100_cubic = np.roots(cubic_coeffs)
    x_at_neg_100_cubic = x_at_neg_100_cubic[np.isreal(x_at_neg_100_cubic)].real

    params.append(np.concatenate([coeffs.flatten(), x_at_neg_100_cubic.flatten(), max_line.flatten()]))  

    x_fit = np.linspace(0, max_line, 1000)
    y_fit = cubic_fit(x_fit)

    linear_coeffs = np.polyfit(stats_linear.index, stats_linear['mean'], 1)
    linear_fit = np.poly1d(linear_coeffs)

    x_linear_fit = np.linspace(2/3*stats_linear.index.min(), 1.5*stats_linear.index.max(), 1000)
    y_linear_fit = linear_fit(x_linear_fit)

    plt.scatter(odds["Line"], odds["Odds"], label="Sportsbook Lines")
    plt.errorbar(stats_linear.index, stats_linear['mean'], yerr=stats_linear['std'], color="black", fmt='x', capsize=5, label="average")
    
    x_below = x_fit[x_fit < x_at_neg_100_cubic.min()]
    y_below = cubic_fit(x_below) + 200

    x_above = x_fit[x_fit >= x_at_neg_100_cubic.min()]
    y_above = cubic_fit(x_above)

    y_new = np.concat([y_below, y_above])

    plt.rcParams['font.family'] = 'Arial'
    plt.minorticks_on()
    plt.tick_params(axis='x', which='major', direction="inout")

    plt.plot(x_fit, y_new, 'r-', label="Cubic Fit (Under)")
    plt.plot(x_fit, -y_new, 'b-', label="Cubic Fit (Over)")

    plt.plot(x_linear_fit, y_linear_fit, color="black", linestyle='--', label="Linear Fit")
    plt.legend()
    plt.xlabel("Money Line", fontweight="bold")
    plt.ylabel("Odds", fontweight="bold")

    plt.title("Money Lines vs Betting Odds for LeBron James")
    plt.show()

print(np.array(params))