import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import PageLayout from '../components/Layout/PageLayout';
import Spinner from '../components/ui/Spinner';
import { Employee } from '../utils/supabase';
import toast from 'react-hot-toast';

const AddPayrollPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    month: new Date().toISOString().slice(0, 7), // Default to current month (YYYY-MM)
    salary: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setEmployees(data || []);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Error fetching employees: ${error.message}`);
        } else {
          toast.error('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Convert salary to number
      const salary = parseFloat(formData.salary);
      
      if (isNaN(salary)) {
        throw new Error('Salary must be a valid number');
      }

      const { error } = await supabase.from('payrolls').insert([
        {
          employee_id: formData.employee_id,
          month: formData.month,
          salary: salary,
        },
      ]);

      if (error) throw error;
      
      toast.success('Payroll added successfully');
      navigate('/reports');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error adding payroll: ${error.message}`);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Add Payroll">
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Add Payroll">
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
        <div className="space-y-6">
          <div>
            <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700 mb-1">
              Select Employee
            </label>
            <select
              id="employee_id"
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select Employee --</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.designation}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <input
              id="month"
              name="month"
              type="month"
              value={formData.month}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
              Salary Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                id="salary"
                name="salary"
                type="number"
                step="0.01"
                min="0"
                value={formData.salary}
                onChange={handleChange}
                required
                className="pl-8 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <Spinner size="sm" /> 
                  <span className="ml-2">Processing...</span>
                </>
              ) : (
                'Add Payroll'
              )}
            </button>
          </div>
        </div>
      </form>
    </PageLayout>
  );
};

export default AddPayrollPage;