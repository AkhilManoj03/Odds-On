import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

def get_coefficients(df, degree):
    return np.polyfit(df.index, df['mean'], degree)

def set_pivot(df):
    df = df.iloc[1:-1]
    pivot_point = [np.mean(df.index), df["mean"].mean()]    
    plt.scatter(pivot_point[0], pivot_point[1], marker='o', facecolor='none', edgecolor='red')
    return pivot_point

def pivot(df, pivot_point):
    df_below = df[df.index < pivot_point[0]]
    df_above = df[df.index > pivot_point[0]]
    df_below["mean"] = df_below["mean"] + df_below["std"]
    df_above["mean"] = df_above["mean"] - df_above["std"]
    return pd.concat([df_below, df_above])

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

def get_params(path):
    odds = pd.read_csv(path)
    avg_odds = odds.groupby('point')['price'].agg(['mean', 'std'])

    min_line = avg_odds.index.min() - 50
    max_line = avg_odds.index.max() + 50

    plt.rcParams['font.family'] = 'Arial'
    plt.minorticks_on()
    plt.tick_params(axis='x', which='major', direction="inout")

    plt.scatter(odds["point"], odds["price"], label="Sportsbook Lines")
    plot_mean(avg_odds)

    linear_coeffs = get_coefficients(avg_odds, 1)
    plot_fit(linear_coeffs, min_line, max_line)

    avg_odds = pd.concat([pd.DataFrame([[1000, 0]], columns=['mean', 'std'], index=[min_line]), avg_odds])
    avg_odds = pd.concat([avg_odds, pd.DataFrame([[-1000, 0]], columns=['mean', 'std'], index=[max_line])])

    cubic_coeffs = get_coefficients(avg_odds, 3)
    plot_fit(cubic_coeffs, min_line, max_line)

    max_der = max_derivative(cubic_coeffs, min_line, max_line)
    while max_der > 0:
        pivot_point = set_pivot(avg_odds)
        avg_odds = pivot(avg_odds, pivot_point)
        plot_mean(avg_odds)
        cubic_coeffs = get_coefficients(avg_odds, 3)
        plot_fit(cubic_coeffs, min_line, max_line)
        max_der = max_derivative(cubic_coeffs, min_line, max_line)

    plt.show()

    line = get_line(cubic_coeffs)
    plot_line(cubic_coeffs, min_line, max_line, line)
    plt.show()

    return [cubic_coeffs, line, min_line, max_line]


path = '/Users/josh/Documents/2024-5 Spring/available_lines_rows2.csv'

print(get_params(path))
