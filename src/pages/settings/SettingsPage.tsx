import { Link } from 'react-router-dom';
import { Building, Users, MapPin, Award, Layers, TrendingUp, Package, Briefcase } from 'lucide-react';

export const SettingsPage = () => {
  const settings = [
    { name: 'Departments', icon: Building, href: '/settings/departments' },
    { name: 'Teams', icon: Users, href: '/settings/teams' },
    { name: 'Locations', icon: MapPin, href: '/settings/locations' },
    { name: 'Competencies', icon: Award, href: '/settings/competencies' },
    { name: 'Job Bands', icon: Layers, href: '/settings/job-bands' },
    { name: 'Job Grades', icon: TrendingUp, href: '/settings/job-grades' },
    { name: 'Job Positions', icon: Briefcase, href: '/settings/job-positions' },
    { name: 'Company Assets', icon: Package, href: '/settings/company-assets' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settings.map((setting) => (
          <Link
            key={setting.name}
            to={setting.href}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg">
                <setting.icon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{setting.name}</h3>
                <p className="text-sm text-gray-500">Manage {setting.name.toLowerCase()}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};