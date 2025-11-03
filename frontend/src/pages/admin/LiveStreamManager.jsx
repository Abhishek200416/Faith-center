import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, useBrand, useAuth } from '@/App';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Edit, Trash2, Video } from 'lucide-react';
import { toast } from 'sonner';

const LiveStreamManager = () => {
  const { currentBrand } = useBrand();
  const { authToken } = useAuth();
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStream, setEditingStream] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stream_url: '',
    thumbnail_url: '',
    is_live: false,
    scheduled_time: ''
  });

  useEffect(() => {
    if (currentBrand) {
      loadStreams();
    }
  }, [currentBrand]);

  const loadStreams = async () => {
    try {
      const response = await axios.get(`${API}/live-streams?brand_id=${currentBrand.id}`);
      setStreams(response.data);
    } catch (error) {
      console.error('Error loading streams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingStream) {
        await axios.put(
          `${API}/live-streams/${editingStream.id}`,
          { ...formData, brand_id: brandId },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        toast.success('Stream updated successfully');
      } else {
        await axios.post(
          `${API}/live-streams`,
          { ...formData, brand_id: brandId },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        toast.success('Stream created successfully');
      }

      setShowModal(false);
      setEditingStream(null);
      resetForm();
      loadStreams();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const deleteStream = async (streamId) => {
    if (!window.confirm('Delete this stream?')) return;

    try {
      await axios.delete(`${API}/live-streams/${streamId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      toast.success('Stream deleted');
      loadStreams();
    } catch (error) {
      toast.error('Failed to delete stream');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      stream_url: '',
      thumbnail_url: '',
      is_live: false,
      scheduled_time: ''
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin h-8 w-8" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Live Streams</h2>
        <Button onClick={() => { setShowModal(true); setEditingStream(null); resetForm(); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Stream
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {streams.map((stream) => (
          <div key={stream.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Video className="h-6 w-6 text-blue-600" />
                <h3 className="font-bold text-lg">{stream.title}</h3>
              </div>
              {stream.is_live && (
                <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                  LIVE
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-3">{stream.description}</p>
            {stream.scheduled_time && !stream.is_live && (
              <p className="text-sm text-gray-500 mb-3">
                Scheduled: {new Date(stream.scheduled_time).toLocaleString()}
              </p>
            )}
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingStream(stream);
                  setFormData(stream);
                  setShowModal(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteStream(stream.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingStream ? 'Edit Stream' : 'Add New Stream'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stream URL (YouTube/Vimeo)</label>
                <input
                  type="url"
                  required
                  value={formData.stream_url}
                  onChange={(e) => setFormData({ ...formData, stream_url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_live}
                  onChange={(e) => setFormData({ ...formData, is_live: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">Currently Live</label>
              </div>
              {!formData.is_live && (
                <div>
                  <label className="block text-sm font-medium mb-1">Scheduled Time</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_time ? formData.scheduled_time.slice(0, 16) : ''}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              )}
              <div className="flex space-x-3">
                <Button type="submit" className="flex-1">Save</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowModal(false); setEditingStream(null); resetForm(); }}
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

export default LiveStreamManager;