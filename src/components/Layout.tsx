import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  BookOpen, 
  FileText, 
  Settings, 
  LogOut, 
  Users, 
  GraduationCap,
  Shield,
  Menu,
  X
} from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavigationItems = () => {
    if (!user) return [];

    const baseItems = [
      { path: '/dashboard', label: 'Dashboard', icon: Home }
    ];

    switch (user.role) {
      case 'admin':
        return [
          ...baseItems,
          { path: '/courses', label: 'Courses', icon: BookOpen },
          { path: '/applications', label: 'Applications', icon: FileText },
          { path: '/users', label: 'Users', icon: Users },
          { path: '/admin', label: 'Admin Panel', icon: Shield }
        ];
      case 'staff':
        return [
          ...baseItems,
          { path: '/courses', label: 'Courses', icon: BookOpen },
          { path: '/applications', label: 'Applications', icon: FileText }
        ];
      case 'student':
        return [
          ...baseItems,
          { path: '/courses', label: 'My Courses', icon: BookOpen },
          { path: '/progress', label: 'Progress', icon: GraduationCap }
        ];
      case 'applicant':
        return [
          ...baseItems,
          { path: '/apply', label: 'Application', icon: FileText }
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1c2341] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <div className="flex items-center">
            <GraduationCap className="h-8 w-8 text-[#eac66d]" />
            <div className="ml-2">
              <div className="text-white font-bold text-base sm:text-lg">Oakridge</div>
              <div className="text-gray-300 text-sm -mt-1">Education Center</div>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${isActive ? 'bg-[#eac66d] text-[#1c2341]' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4">
          <div className="flex items-center mb-4">
            <img
              src={user.avatar}
              alt={user.username}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
            />
            <div className="ml-3">
              <p className="text-xs sm:text-sm font-medium text-white truncate">{user.username}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors duration-200"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        <header className="bg-white shadow-sm border-b border-gray-200 lg:pl-0">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Oakridge</h1>
                <p className="text-sm text-gray-600 -mt-1">Education Center</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${user.status === 'accepted' ? 'bg-green-100 text-green-800' : user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                {user.status}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-2 sm:p-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;