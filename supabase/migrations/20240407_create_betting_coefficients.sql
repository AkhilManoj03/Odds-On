-- Create betting_coefficients table if it doesn't exist
CREATE TABLE IF NOT EXISTS betting_coefficients (
  id SERIAL PRIMARY KEY,
  game_id TEXT NOT NULL UNIQUE,
  cubic_coeff_0 DOUBLE PRECISION NOT NULL,
  cubic_coeff_1 DOUBLE PRECISION NOT NULL,
  cubic_coeff_2 DOUBLE PRECISION NOT NULL,
  cubic_coeff_3 DOUBLE PRECISION NOT NULL,
  line DOUBLE PRECISION NOT NULL,
  min_line DOUBLE PRECISION NOT NULL,
  max_line DOUBLE PRECISION NOT NULL,
  commence_time TIMESTAMP WITH TIME ZONE,
  home_team TEXT,
  away_team TEXT,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index on game_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_betting_coefficients_game_id ON betting_coefficients(game_id);

-- Add comment to the table
COMMENT ON TABLE betting_coefficients IS 'Stores polynomial coefficients for betting odds calculations'; 