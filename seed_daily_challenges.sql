-- Insert 30 days of daily challenges
-- Using a DO block to loop and generate the next 30 days dynamically

DO $$
DECLARE
    current_dt DATE := CURRENT_DATE;
BEGIN
    INSERT INTO public.daily_challenges (prompt, hashtag, active_date) VALUES
    ('Show us your morning routine in 10 seconds', 'MorningRush', current_dt),
    ('Rate your fridge contents out of 10', 'FridgeCheck', current_dt + interval '1 day'),
    ('Your best impression of your pet', 'PetLife', current_dt + interval '2 days'),
    ('The most creative use of a household item', 'LifeHack', current_dt + interval '3 days'),
    ('What''s your hidden talent?', 'HiddenTalent', current_dt + interval '4 days'),
    ('A tour of your workspace in 5 seconds', 'DeskCheck', current_dt + interval '5 days'),
    ('Sing your favorite song with a mouth full of water', 'WaterChallenge', current_dt + interval '6 days'),
    ('Describe your mood using only emojis (act them out!)', 'EmojiMood', current_dt + interval '7 days'),
    ('Show us the oldest thing in your room', 'VintageFinds', current_dt + interval '8 days'),
    ('Do 10 jumping jacks in slow motion', 'SlowMoFitness', current_dt + interval '9 days'),
    ('Show off your favorite mug', 'MugShot', current_dt + interval '10 days'),
    ('Recreate a famous meme', 'MemeIRL', current_dt + interval '11 days'),
    ('Your best attempt at a magic trick', 'MagicFail', current_dt + interval '12 days'),
    ('Show us your go-to snack', 'SnackAttack', current_dt + interval '13 days'),
    ('Read a dramatic excerpt from a boring book', 'DramaticReading', current_dt + interval '14 days'),
    ('Show us your weirdest pair of socks', 'SockCheck', current_dt + interval '15 days'),
    ('Balance a book on your head and walk', 'BalanceChallenge', current_dt + interval '16 days'),
    ('Make a beat using only pens and a desk', 'DeskBeats', current_dt + interval '17 days'),
    ('Show us a DIY project gone wrong (or right!)', 'DIYDiaries', current_dt + interval '18 days'),
    ('What''s your phone wallpaper and why?', 'WallpaperReveal', current_dt + interval '19 days'),
    ('Show us your best dance move in 3 seconds', 'QuickStep', current_dt + interval '20 days'),
    ('Try to juggle 3 items (any items)', 'JugglingAct', current_dt + interval '21 days'),
    ('Show us your favorite hoodie', 'HoodieSeason', current_dt + interval '22 days'),
    ('Share an unpopular opinion (lighthearted!)', 'HotTake', current_dt + interval '23 days'),
    ('Show us the last photo saved on your camera roll', 'CameraRoll', current_dt + interval '24 days'),
    ('Make the weirdest face you can muster', 'FaceOff', current_dt + interval '25 days'),
    ('Show us your handwriting', 'Penmanship', current_dt + interval '26 days'),
    ('Review a glass of water like a food critic', 'WaterCritic', current_dt + interval '27 days'),
    ('Show us your plant collection (or lack thereof)', 'PlantParent', current_dt + interval '28 days'),
    ('Say a tongue twister 3 times fast', 'TongueTwister', current_dt + interval '29 days')
    ON CONFLICT (active_date) DO NOTHING;
END $$;
