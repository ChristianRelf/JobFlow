import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSupabaseProfiles } from '../hooks/useSupabaseProfiles';
import { 
  Users as UsersIcon, 
  Search, 
  Filter, 
  Shield, 
  BookOpen,
  FileText,
  GraduationCap,
  MoreVertical,
  Edit,
  TrendingUp,
  Award,
  Activity
} from 'lucide-react';
import { User } from '../types';

const Users = () => {
  const { user: currentUser } = useAuth();
  const { profiles, loading, updateRole, userProgress } = useSupabaseProfiles();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1c2341] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = profiles.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.discord_id || '').includes(searchTerm);
    
    if (!matchesSearch) return false;
    
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (statusFilter !== 'all' && user.status !== statusFilter) return false;
    
    return true;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'staff':
        return <UsersIcon className="h-4 w-4 text-blue-600" />;
      case 'student':
        return <BookOpen className="h-4 w-4 text-green-600" />;
      case 'applicant':
        return <FileText className="h-4 w-4 text-yellow-600" />;
      default:
        return <GraduationCap className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'staff':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      case 'applicant':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRoleChange = async (userId: string, newRole: User['role']) => {
    try {
      await updateRole(userId, newRole);
      alert(`User role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('There was an error updating the user role. Please try again.');
    }
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const totalCertificates = userProgress ? userProgress.filter(p => p.certificate_earned).length : 0;

  const roleCounts = {
    all: profiles.length,
    admin: profiles.filter(u => u.role === 'admin').length,
    staff: profiles.filter(u => u.role === 'staff').length,
    student: profiles.filter(u => u.role === 'student').length,
    applicant: profiles.filter(u => u.role === 'applicant').length
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage user roles and permissions across the platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{roleCounts.all}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Admins</p>
              <p className="text-2xl font-semibold text-gray-900">{roleCounts.admin}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Staff</p>
              <p className="text-2xl font-semibold text-gray-900">{roleCounts.staff}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Students</p>
              <p className="text-2xl font-semibold text-gray-900">{roleCounts.student}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Applicants</p>
              <p className="text-2xl font-semibold text-gray-900">{roleCounts.applicant}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="student">Student</option>
              <option value="applicant">Applicant</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="accepted">Accepted</option>
            <option value="pending">Pending</option>
            <option value="denied">Denied</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={selectAllUsers}
                      className="h-4 w-4 text-[#1c2341] focus:ring-[#1c2341] border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="h-4 w-4 text-[#1c2341] focus:ring-[#1c2341] border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={user.avatar || `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 6)}.png`}
                          alt={user.username}
                          className="h-10 w-10 rounded-full"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.discord_id || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRoleIcon(user.role)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.last_active || user.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role === 'student' ? (
                        <div className="text-sm">
                          <div className="text-gray-900 font-medium">
                            {/* Calculate user's progress */}
                            {(() => {
                              const userProgressData = userProgress?.filter(p => p.user_id === user.id) || [];
                              const completedCourses = userProgressData.filter(p => p.certificate_earned).length;
                              const totalEnrolled = userProgressData.length;
                              return totalEnrolled > 0 ? `${completedCourses}/${totalEnrolled} courses` : 'No courses';
                            })()}
                          </div>
                          <div className="text-gray-500">
                            {(() => {
                              const userProgressData = userProgress?.filter(p => p.user_id === user.id) || [];
                              const avgProgress = userProgressData.length > 0 
                                ? Math.round(userProgressData.reduce((acc, p) => acc + p.overall_progress, 0) / userProgressData.length)
                                : 0;
                              return `${avgProgress}% avg`;
                            })()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as 'applicant' | 'student' | 'staff' | 'admin')}
                          disabled={user.id === currentUser?.id}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="applicant">Applicant</option>
                          <option value="student">Student</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          className="text-gray-400 hover:text-gray-600"
                          title="More actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer with Pagination Info */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {filteredUsers.length} of {profiles.length} users
              </div>
              <div className="text-sm text-gray-500">
                {selectedUsers.length > 0 && `${selectedUsers.length} selected`}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12">
          <div className="text-center">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No users have been registered yet.'
              }
            </p>
          </div>
        </div>
      )}
      
      {/* User Statistics */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">User Statistics</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-3">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Growth Rate</h3>
              <p className="text-2xl font-bold text-blue-600">
                {(() => {
                  const thisMonth = profiles.filter(p => {
                    const created = new Date(p.created_at);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                  }).length;
                  return thisMonth;
                })()}
              </p>
              <p className="text-sm text-gray-500">New this month</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Retention</h3>
              <p className="text-2xl font-bold text-green-600">
                {profiles.filter(p => p.status === 'accepted').length > 0 
                  ? Math.round((profiles.filter(p => p.status === 'accepted' && p.role === 'student').length / profiles.filter(p => p.status === 'accepted').length) * 100)
                  : 0}%
              </p>
              <p className="text-sm text-gray-500">Active students</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-3">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Achievement</h3>
              <p className="text-2xl font-bold text-purple-600">
                {profiles.filter(p => p.role === 'student').length > 0 
                  ? Math.round((totalCertificates / profiles.filter(p => p.role === 'student').length) * 100) / 100
                  : 0}
              </p>
              <p className="text-sm text-gray-500">Avg certificates</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 p-3 rounded-full w-fit mx-auto mb-3">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Engagement</h3>
              <p className="text-2xl font-bold text-orange-600">
                {profiles.filter(p => {
                  const lastActive = new Date(p.last_active || p.updated_at);
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return lastActive > weekAgo;
                }).length}
              </p>
              <p className="text-sm text-gray-500">Active this week</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;