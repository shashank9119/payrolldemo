/*
  # Create employees table

  1. New Tables
    - `employees`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `email` (text, not null, unique)
      - `designation` (text, not null)
      - `created_at` (timestamptz, default: now())
  2. Security
    - Enable RLS on `employees` table
    - Add policies for authenticated users to read all employees
*/

CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  designation text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read all employees"
  ON employees
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert some sample data
INSERT INTO employees (name, email, designation)
VALUES
  ('John Doe', 'john.doe@example.com', 'Software Engineer'),
  ('Jane Smith', 'jane.smith@example.com', 'HR Manager'),
  ('Michael Johnson', 'michael.johnson@example.com', 'Marketing Specialist'),
  ('Emily Davis', 'emily.davis@example.com', 'Financial Analyst'),
  ('David Wilson', 'david.wilson@example.com', 'Product Manager')
ON CONFLICT (email) DO NOTHING;