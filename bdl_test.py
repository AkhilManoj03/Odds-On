from balldontlie import BalldontlieAPI

api = BalldontlieAPI(api_key="78c72ed5-055b-4db5-b4a0-7c53987a14c1")

# Get the games data
response = api.nba.games.list(start_date="2025-04-05")

# Access the data and metadata
games = response.data  # This is the list of games
metadata = response.meta  # This contains pagination info

# Print each game's details
print("\nGames:")
for game in games:
    print(f"\nGame ID: {game.id}")
    print(f"Date: {game.date}")
    print(f"Home Team: {game.home_team.full_name}")
    print(f"Away Team: {game.visitor_team.full_name}")
    print(f"Status: {game.status}")
    print(f"Season: {game.season}")
    print(f"Home Team Score: {game.home_team_score}")
    print(f"Away Team Score: {game.visitor_team_score}")
    print("-" * 50)