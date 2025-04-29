import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define types for our tables
export type Employee = {
  id: string;
  name: string;
  email: string;
  designation: string;
  created_at?: string;
};

export type Payroll = {
  id: string;
  employee_id: string;
  month: string;
  salary: number;
  payslip_url?: string;
  created_at?: string;
  employee?: Employee;
};