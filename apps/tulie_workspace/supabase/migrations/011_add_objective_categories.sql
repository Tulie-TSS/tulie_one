-- Migration: 011_add_objective_categories.sql
-- Add category to objectives for Life Pillars balance

ALTER TABLE objectives
ADD COLUMN category VARCHAR(50) DEFAULT 'work';

-- Optional: update existing individual objectives to have 'work'
UPDATE objectives SET category = 'work' WHERE level = 'individual';
