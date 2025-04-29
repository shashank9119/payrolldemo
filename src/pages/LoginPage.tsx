import AuthForm from '../components/Auth/AuthForm';
import { Briefcase as BriefcaseBusiness } from 'lucide-react';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-blue-600 shadow-lg">
            <BriefcaseBusiness className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">PayrollPro</h1>
        <p className="text-gray-600">Manage your payroll operations efficiently</p>
      </div>
      <AuthForm />
    </div>
  );
};

export default LoginPage;