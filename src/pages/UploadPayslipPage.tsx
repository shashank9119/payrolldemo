import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import PageLayout from '../components/Layout/PageLayout';
import Spinner from '../components/ui/Spinner';
import { Employee, Payroll } from '../utils/supabase';
import { Upload, FileText, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const UploadPayslipPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employees
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('*')
          .order('name');
        
        if (employeesError) throw employeesError;
        setEmployees(employeesData || []);

        // Fetch payrolls that don't have a payslip URL yet
        const { data: payrollsData, error: payrollsError } = await supabase
          .from('payrolls')
          .select('*, employee:employees(name)')
          .is('payslip_url', null);
        
        if (payrollsError) throw payrollsError;
        setPayrolls(payrollsData || []);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Error fetching data: ${error.message}`);
        } else {
          toast.error('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Clear month when employee changes
    if (selectedEmployee) {
      setSelectedMonth('');
    }
  }, [selectedEmployee]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    
    // Clear any previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    
    // Generate preview for new file
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const getAvailableMonths = () => {
    if (!selectedEmployee) return [];
    
    return payrolls
      .filter(p => p.employee_id === selectedEmployee)
      .map(p => ({
        id: p.id,
        month: p.month,
        label: new Date(p.month + '-01').toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        })
      }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !selectedMonth) {
      toast.error('Please select a file and payroll entry');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Upload file to Supabase Storage
      const fileName = `payslip_${selectedEmployee}_${new Date().getTime()}.pdf`;
      const { data, error: uploadError } = await supabase.storage
        .from('payslips')
        .upload(fileName, file, {
          cacheControl: '3600',
          contentType: 'application/pdf',
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('payslips')
        .getPublicUrl(fileName);
      
      // Update payroll record with the payslip URL
      const { error: updateError } = await supabase
        .from('payrolls')
        .update({ payslip_url: publicUrl })
        .eq('id', selectedMonth);
      
      if (updateError) throw updateError;
      
      // Success message
      toast.success('Payslip uploaded successfully');
      
      // Reset form
      setSelectedEmployee('');
      setSelectedMonth('');
      setFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      
      // Refresh payrolls data
      const { data: refreshedData, error: refreshError } = await supabase
        .from('payrolls')
        .select('*, employee:employees(name)')
        .is('payslip_url', null);
      
      if (refreshError) throw refreshError;
      setPayrolls(refreshedData || []);
      
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error uploading payslip: ${error.message}`);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Upload Payslip">
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  const availableMonths = getAvailableMonths();

  return (
    <PageLayout title="Upload Payslip">
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
        <div className="space-y-6">
          <div>
            <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700 mb-1">
              Select Employee
            </label>
            <select
              id="employee_id"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={submitting}
            >
              <option value="">-- Select Employee --</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
              Select Payroll Month
            </label>
            <select
              id="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              required
              disabled={!selectedEmployee || submitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select Month --</option>
              {availableMonths.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {selectedEmployee && availableMonths.length === 0 && (
              <p className="mt-1 text-sm text-red-600">
                No payroll entries without payslips found for this employee
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload PDF Payslip
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <div className="flex justify-center">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept="application/pdf"
                      className="sr-only"
                      onChange={handleFileChange}
                      disabled={!selectedMonth || submitting}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF up to 10MB</p>
                {file && (
                  <p className="text-sm text-green-600">
                    Selected: {file.name} ({Math.round(file.size / 1024)} KB)
                  </p>
                )}
              </div>
            </div>
          </div>

          {previewUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preview
              </label>
              <div className="mt-1 border border-gray-300 rounded-md p-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Preview PDF
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting || !selectedMonth || !file}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Spinner size="sm" />
                  <span className="ml-2">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Payslip
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </PageLayout>
  );
};

export default UploadPayslipPage;