import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Settings,
  Users,
  Activity,
  LogOut,
  User,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export const MainLayout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'viewer'] },
    { name: 'Job Descriptions', href: '/job-descriptions', icon: FileText, roles: ['admin', 'manager', 'viewer'] },
    { name: 'Users', href: '/users', icon: Users, roles: ['admin'] },
    { name: 'Activity Log', href: '/activity-log', icon: Activity, roles: ['admin'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] },
  ];

  const filteredNav = navigation.filter((item) =>
    !item.roles || item.roles.includes(user?.role || 'viewer')
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-primary-600/20 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-xl shadow-apple-lg transform transition-all duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-8 border-b border-primary-100/50">
            <h1 className="text-heading-3 font-semibold text-primary-600">
              Job Description Management
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-primary-400 hover:text-primary-600 hover:bg-primary-50 rounded-full p-2 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-8 space-y-2 overflow-y-auto">
            {filteredNav.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-body font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-accent-500 text-white shadow-apple'
                      : 'text-primary-500 hover:bg-primary-50/50 hover:text-primary-600'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="border-t border-primary-100/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full shadow-apple">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-sm font-semibold text-primary-600 truncate">
                  {user?.full_name}
                </p>
                <p className="text-caption text-primary-400 capitalize">{user?.role}</p>
              </div>
            </div>
            <div className="space-y-1">
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2.5 text-body-sm rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-primary-500 hover:bg-primary-50/50 hover:text-primary-600'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </NavLink>
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-2.5 text-body-sm text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-white/80 backdrop-blur-xl border-b border-primary-100/50 lg:hidden shadow-apple print:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-primary-500 hover:text-primary-600 hover:bg-primary-50 rounded-full p-2 transition-all duration-200"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-heading-3 font-semibold text-primary-600">
            Job Description Management
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Page content */}
        <main className="p-8 lg:p-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
