import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';

const MembersManager = ({ brandId, authToken }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  useEffect(() => {
    loadMembers();
  }, [brandId]);

  const loadMembers = async () => {
    try {
      const response = await axios.get(
        `${API}/users?brand_id=${brandId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setMembers(response.data);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingMember) {
        await axios.put(
          `${API}/users/${editingMember.id}`,
          formData,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        toast.success('Member updated successfully');
      } else {
        await axios.post(
          `${API}/users`,
          { ...formData, brand_id: brandId },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        toast.success('Member added successfully');
      }

      setShowModal(false);
      setEditingMember(null);
      setFormData({ name: '', email: '', phone: '', password: '' });
      loadMembers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const toggleMemberStatus = async (memberId, isActive) => {
    try {
      await axios.put(
        `${API}/users/${memberId}/status?is_active=${!isActive}`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      toast.success(`Member ${!isActive ? 'activated' : 'deactivated'}`);
      loadMembers();
    } catch (error) {
      toast.error('Failed to update member status');
    }
  };

  const deleteMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;

    try {
      await axios.delete(`${API}/users/${memberId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      toast.success('Member deleted');
      loadMembers();
    } catch (error) {
      toast.error('Failed to delete member');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Members Management</h2>
        <Button onClick={() => { setShowModal(true); setEditingMember(null); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{member.name}</td>
                <td className="px-6 py-4">{member.email}</td>
                <td className="px-6 py-4">{member.phone || 'N/A'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {member.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleMemberStatus(member.id, member.is_active)}
                    >
                      {member.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {editingMember ? 'Edit Member' : 'Add New Member'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              {!editingMember && (
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              )}
              <div className="flex space-x-3">
                <Button type="submit" className="flex-1">Save</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setEditingMember(null);
                    setFormData({ name: '', email: '', phone: '', password: '' });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersManager;