import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import PageLayout from '../components/Layout/PageLayout';
import Spinner from '../components/ui/Spinner';
import { Employee } from '../utils/supabase';
import { UserRound, Mail, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <PageLayout title="Employee Dashboard">
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No employees found</p>
          <p className="text-sm text-gray-400">
            Employee records will appear here when added to the database
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <UserRound className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{employee.name}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{employee.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    <span>{employee.designation}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default DashboardPage;