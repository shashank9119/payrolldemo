/*
  # Create payrolls table

  1. New Tables
    - `payrolls`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key to employees.id)
      - `month` (text, format YYYY-MM)
      - `salary` (numeric, not null)
      - `payslip_url` (text, nullable)
      - `created_at` (timestamptz, default: now())
  2. Security
    - Enable RLS on `payrolls` table
    - Add policies for authenticated users to read all payrolls
    - Add policies for authenticated users to insert and update payrolls
*/

CREATE TABLE IF NOT EXISTS payrolls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  month text NOT NULL,
  salary numeric NOT NULL,
  payslip_url text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (employee_id, month)
);

-- Enable Row Level Security
ALTER TABLE payrolls ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read all payrolls"
  ON payrolls
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert payrolls"
  ON payrolls
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update payrolls"
  ON payrolls
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create storage bucket for payslips
INSERT INTO storage.buckets (id, name) 
VALUES ('payslips', 'payslips') 
ON CONFLICT (id) DO NOTHING;

-- Set up storage permissions
CREATE POLICY "Allow authenticated users to upload payslips"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'payslips');

CREATE POLICY "Allow authenticated users to read payslips"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'payslips');