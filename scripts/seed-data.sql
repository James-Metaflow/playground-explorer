-- Insert default rating categories
INSERT INTO rating_categories (name, description, user_id) VALUES
('Safety', 'How safe is the playground?', NULL),
('Equipment Quality', 'Quality and condition of play equipment', NULL),
('Cleanliness', 'How clean and well-maintained is the area?', NULL),
('Age Appropriateness', 'Suitable for the intended age group?', NULL),
('Accessibility', 'Accessible for children with disabilities?', NULL),
('Overall Fun Factor', 'How much fun did your child have?', NULL);

-- Insert sample playgrounds
INSERT INTO playgrounds (name, location, description, age_range, accessibility, opening_hours, equipment, facilities) VALUES
('Sunshine Adventure Park', 'Hyde Park, London', 'A fantastic playground with modern equipment suitable for children of all ages. Features include climbing frames, swings, slides, and a dedicated toddler area.', '2-12 years', 'Wheelchair accessible', '6:00 AM - 10:00 PM', ARRAY['Swings', 'Slides', 'Climbing Frame', 'Sand Pit', 'Toddler Area'], ARRAY['Toilets', 'Parking', 'Cafe nearby', 'Picnic Tables']),

('Rainbow Play Area', 'Regent''s Park, London', 'A colorful playground perfect for younger children with safe, age-appropriate equipment.', '2-8 years', 'Partially accessible', '7:00 AM - 9:00 PM', ARRAY['Swings', 'See-saw', 'Monkey Bars', 'Spring Riders'], ARRAY['Toilets', 'Benches']),

('Castle Playground', 'Hampstead Heath, London', 'An exciting castle-themed playground with challenging equipment for older children.', '4-14 years', 'Wheelchair accessible', '24 hours', ARRAY['Castle Structure', 'Zip Line', 'Climbing Wall', 'Slides'], ARRAY['Toilets', 'Parking', 'Picnic Tables', 'Water Fountain']),

('Little Explorers Park', 'Greenwich Park, London', 'A safe and secure playground designed specifically for toddlers and young children.', '1-6 years', 'Fully accessible', '6:00 AM - 8:00 PM', ARRAY['Toddler Area', 'Swings', 'Spring Riders', 'Sand Pit'], ARRAY['Toilets', 'Parking', 'Cafe nearby', 'Baby Changing']),

('Adventure Heights', 'Clapham Common, London', 'A thrilling playground with high climbing structures and challenging obstacles.', '6-16 years', 'Partially accessible', '7:00 AM - 9:00 PM', ARRAY['Climbing Frame', 'Zip Line', 'Rope Course', 'Basketball Hoop'], ARRAY['Toilets', 'Parking', 'Benches']);
