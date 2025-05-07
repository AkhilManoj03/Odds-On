-- Trigger that executes the handle_game_completion function when the 
create or replace trigger on_game_complete
  before update of final_score, status on todays_games
  for each row
  execute function handle_game_completion();
