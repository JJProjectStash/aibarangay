import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Newspaper } from 'lucide-react';
import { Button, Card, CardContent, Input, Label, Textarea, Modal, ConfirmDialog, FileUpload } from '../components/UI';
import { api } from '../services/api';
import { NewsItem } from '../types';

const AdminNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean, id: string | null}>({isOpen: false, id: null});
  
  const [formData, setFormData] = useState({ title: '', summary: '', content: '', imageUrl: '', author: 'Admin' });

  const fetchNews = async () => {
    setLoading(true);
    const data = await api.getNews();
    setNews(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createNews(formData);
    setShowModal(false);
    setFormData({ title: '', summary: '', content: '', imageUrl: '', author: 'Admin' });
    fetchNews();
  };

  const handleDelete = async () => {
      if(deleteDialog.id) {
          await api.deleteNews(deleteDialog.id);
          setDeleteDialog({isOpen: false, id: null});
          fetchNews();
      }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">News CMS</h1>
          <p className="text-gray-500">Manage community news and articles</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add News Article
        </Button>
      </div>

      <div className="grid gap-6">
          {loading ? <div>Loading...</div> : news.map(item => (
              <Card key={item.id} className="flex flex-col md:flex-row overflow-hidden">
                  <div className="w-full md:w-48 h-48 md:h-auto bg-gray-200 relative">
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                          <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-500 mb-2">{new Date(item.publishedAt).toLocaleDateString()} by {item.author}</p>
                          <p className="text-gray-600 line-clamp-2">{item.summary}</p>
                      </div>
                      <div className="mt-4 flex justify-end">
                          <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => setDeleteDialog({isOpen: true, id: item.id})}>
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </Button>
                      </div>
                  </div>
              </Card>
          ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create News Article">
          <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                  <Label required>Title</Label>
                  <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                  <Label required>Summary</Label>
                  <Input value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} placeholder="Short description for list view" />
              </div>
              <div className="space-y-2">
                  <Label required>Content</Label>
                  <Textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="h-32" />
              </div>
              <div className="space-y-2">
                  <FileUpload 
                    label="Article Image"
                    value={formData.imageUrl} 
                    onChange={val => setFormData({...formData, imageUrl: val})} 
                  />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit">Publish</Button>
              </div>
          </form>
      </Modal>

      <ConfirmDialog 
        isOpen={deleteDialog.isOpen} 
        onClose={() => setDeleteDialog({isOpen: false, id: null})}
        onConfirm={handleDelete}
        title="Delete Article"
        description="Are you sure? This action cannot be undone."
      />
    </div>
  );
};

export default AdminNews;