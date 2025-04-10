-- Create the betting_coefficients table if it doesn't exist
CREATE TABLE IF NOT EXISTS betting_coefficients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    game_id TEXT NOT NULL,
    cubic_coeff_1 FLOAT,
    cubic_coeff_2 FLOAT,
    cubic_coeff_3 FLOAT,
    cubic_coeff_4 FLOAT,
    x_at_neg_100 FLOAT,
    min_line FLOAT,
    max_line FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(game_id)
);

-- Create function to process odds and calculate coefficients
CREATE OR REPLACE FUNCTION process_odds_coefficients(p_game_id TEXT)
RETURNS void AS $$
DECLARE
    point_data FLOAT[];
    price_data FLOAT[];
    min_line FLOAT;
    max_line FLOAT;
    cubic_coeffs FLOAT[];
    x_at_neg_100 FLOAT;
    pivot_point FLOAT[];
    max_derivative FLOAT;
    adjusted_data RECORD;
    synthetic_points RECORD;
    i INTEGER;
    x FLOAT;
    derivative FLOAT;
BEGIN
    -- Get the points and prices for the game
    SELECT 
        array_agg(point),
        array_agg(price)
    INTO 
        point_data,
        price_data
    FROM available_lines
    WHERE available_lines.game_id = p_game_id
    AND point IS NOT NULL
    AND price IS NOT NULL;

    -- Only proceed if we have enough data points
    IF array_length(point_data, 1) >= 4 THEN
        -- Calculate min and max lines with padding (matching Python script)
        min_line := (SELECT MIN(point) FROM available_lines WHERE available_lines.game_id = p_game_id) - 50;
        max_line := (SELECT MAX(point) FROM available_lines WHERE available_lines.game_id = p_game_id) + 50;

        -- Create a temporary table to store the data for manipulation
        CREATE TEMP TABLE temp_odds_data AS
        SELECT 
            point,
            price,
            ROW_NUMBER() OVER (ORDER BY point) as idx
        FROM available_lines
        WHERE available_lines.game_id = p_game_id
        AND point IS NOT NULL
        AND price IS NOT NULL;

        -- Add synthetic points at min_line and max_line (matching Python script)
        INSERT INTO temp_odds_data (point, price, idx)
        VALUES 
            (min_line, 1000, 0),
            (max_line, -1000, 9999);

        -- Calculate cubic coefficients
        WITH points AS (
            SELECT point, price FROM temp_odds_data
        )
        SELECT 
            array[
                regr_slope(price, point^3),
                regr_slope(price, point^2),
                regr_slope(price, point),
                regr_intercept(price, point)
            ]
        INTO cubic_coeffs
        FROM points;

        -- Calculate maximum derivative
        -- The derivative of ax³ + bx² + cx + d is 3ax² + 2bx + c
        -- We need to find the maximum value of this derivative in our range
        max_derivative := -999999; -- Initialize with a very small value
        
        -- Use a loop to check derivative at multiple points
        FOR i IN 0..1000 LOOP
            x := min_line + (max_line - min_line) * i / 1000;
            derivative := 3*cubic_coeffs[1]*x^2 + 2*cubic_coeffs[2]*x + cubic_coeffs[3];
            
            IF derivative > max_derivative THEN
                max_derivative := derivative;
            END IF;
        END LOOP;

        -- If the maximum derivative is positive, we need to adjust the data
        -- This is a simplified version of the pivot approach in the Python script
        IF max_derivative > 0 THEN
            -- Find the pivot point (middle of the data)
            SELECT 
                array[
                    AVG(point),
                    AVG(price)
                ]
            INTO pivot_point
            FROM temp_odds_data
            WHERE idx > 0 AND idx < (SELECT MAX(idx) FROM temp_odds_data);

            -- Adjust the data based on the pivot point
            -- This is a simplified version of the pivot function in the Python script
            UPDATE temp_odds_data
            SET price = CASE 
                WHEN point < pivot_point[1] THEN price + 50  -- Add a small constant to ensure increasing
                WHEN point > pivot_point[1] THEN price - 50  -- Subtract a small constant to ensure increasing
                ELSE price
            END
            WHERE idx > 0 AND idx < (SELECT MAX(idx) FROM temp_odds_data);

            -- Recalculate cubic coefficients with adjusted data
            WITH points AS (
                SELECT point, price FROM temp_odds_data
            )
            SELECT 
                array[
                    regr_slope(price, point^3),
                    regr_slope(price, point^2),
                    regr_slope(price, point),
                    regr_intercept(price, point)
                ]
            INTO cubic_coeffs
            FROM points;
        END IF;

        -- Calculate x at -100 (matching Python script)
        cubic_coeffs[4] := cubic_coeffs[4] + 100;
        x_at_neg_100 := (-cubic_coeffs[4]) / cubic_coeffs[3];

        -- Store the coefficients
        INSERT INTO betting_coefficients (
            game_id,
            cubic_coeff_1,
            cubic_coeff_2,
            cubic_coeff_3,
            cubic_coeff_4,
            x_at_neg_100,
            min_line,
            max_line
        ) VALUES (
            p_game_id,
            cubic_coeffs[1],
            cubic_coeffs[2],
            cubic_coeffs[3],
            cubic_coeffs[4] - 100, -- Subtract 100 to store original coefficient
            x_at_neg_100,
            min_line,
            max_line
        )
        ON CONFLICT (game_id) DO UPDATE SET
            cubic_coeff_1 = EXCLUDED.cubic_coeff_1,
            cubic_coeff_2 = EXCLUDED.cubic_coeff_2,
            cubic_coeff_3 = EXCLUDED.cubic_coeff_3,
            cubic_coeff_4 = EXCLUDED.cubic_coeff_4,
            x_at_neg_100 = EXCLUDED.x_at_neg_100,
            min_line = EXCLUDED.min_line,
            max_line = EXCLUDED.max_line,
            created_at = NOW();

        -- Clean up
        DROP TABLE temp_odds_data;
    END IF;
END;
$$ LANGUAGE plpgsql; 