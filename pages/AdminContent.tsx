import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Phone, HelpCircle, Users } from 'lucide-react';
import { Button, Card, CardContent, Input, Label, Textarea, Modal, ConfirmDialog, Tabs, Badge, FileUpload } from '../components/UI';
import { api } from '../services/api';
import { Hotline, FAQ, Official } from '../types';

const AdminContent = () => {
  const [activeTab, setActiveTab] = useState('hotlines');
  
  // Data
  const [hotlines, setHotlines] = useState<Hotline[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean, id: string | null}>({isOpen: false, id: null});

  // Forms
  const [hotlineForm, setHotlineForm] = useState({ name: '', number: '', category: 'emergency' as const });
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'General' });
  const [officialForm, setOfficialForm] = useState({ name: '', position: '', imageUrl: '', contact: '' });

  const fetchData = async () => {
    setLoading(true);
    if(activeTab === 'hotlines') setHotlines(await api.getHotlines());
    if(activeTab === 'faqs') setFaqs(await api.getFAQs());
    if(activeTab === 'officials') setOfficials(await api.getOfficials());
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(activeTab === 'hotlines') await api.createHotline(hotlineForm);
    if(activeTab === 'faqs') await api.createFAQ(faqForm);
    if(activeTab === 'officials') await api.createOfficial(officialForm);
    
    setShowModal(false);
    // Reset forms
    setHotlineForm({ name: '', number: '', category: 'emergency' });
    setFaqForm({ question: '', answer: '', category: 'General' });
    setOfficialForm({ name: '', position: '', imageUrl: '', contact: '' });
    fetchData();
  };

  const handleDelete = async () => {
      if(deleteDialog.id) {
          if(activeTab === 'hotlines') await api.deleteHotline(deleteDialog.id);
          if(activeTab === 'faqs') await api.deleteFAQ(deleteDialog.id);
          if(activeTab === 'officials') await api.deleteOfficial(deleteDialog.id);
          
          setDeleteDialog({isOpen: false, id: null});
          fetchData();
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-500">Manage hotlines, FAQs, and officials</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
        </Button>
      </div>

      <Tabs 
        activeTab={activeTab} 
        onChange={setActiveTab} 
        tabs={[
            { id: 'hotlines', label: 'Emergency Hotlines' },
            { id: 'faqs', label: 'FAQs / Help' },
            { id: 'officials', label: 'Barangay Officials' },
        ]} 
      />

      <div className="grid gap-4">
          {loading ? <div>Loading...</div> : (
              <>
                {activeTab === 'hotlines' && hotlines.map(h => (
                    <Card key={h.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-red-50 rounded text-red-600"><Phone size={20} /></div>
                            <div>
                                <h3 className="font-bold">{h.name}</h3>
                                <p className="text-sm text-gray-500">{h.number} • <span className="uppercase text-xs font-bold">{h.category}</span></p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteDialog({isOpen: true, id: h.id})}><Trash2 size={16} /></Button>
                    </Card>
                ))}

                {activeTab === 'faqs' && faqs.map(f => (
                    <Card key={f.id} className="p-4">
                         <div className="flex justify-between items-start">
                             <div>
                                 <div className="flex items-center gap-2 mb-1">
                                    <HelpCircle size={16} className="text-blue-500" />
                                    <h3 className="font-bold">{f.question}</h3>
                                 </div>
                                 <p className="text-gray-600 text-sm ml-6">{f.answer}</p>
                             </div>
                             <Button variant="ghost" size="sm" onClick={() => setDeleteDialog({isOpen: true, id: f.id})}><Trash2 size={16} /></Button>
                         </div>
                    </Card>
                ))}

                {activeTab === 'officials' && officials.map(o => (
                    <Card key={o.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img src={o.imageUrl} alt={o.name} className="w-12 h-12 rounded-full object-cover bg-gray-200" />
                            <div>
                                <h3 className="font-bold">{o.name}</h3>
                                <p className="text-sm text-gray-500">{o.position}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteDialog({isOpen: true, id: o.id})}><Trash2 size={16} /></Button>
                    </Card>
                ))}
              </>
          )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Add ${activeTab === 'hotlines' ? 'Hotline' : activeTab === 'faqs' ? 'FAQ' : 'Official'}`}>
          <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'hotlines' && (
                  <>
                    <div className="space-y-2">
                        <Label required>Name</Label>
                        <Input value={hotlineForm.name} onChange={e => setHotlineForm({...hotlineForm, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label required>Number</Label>
                        <Input value={hotlineForm.number} onChange={e => setHotlineForm({...hotlineForm, number: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label required>Category</Label>
                        <select className="w-full border rounded p-2" value={hotlineForm.category} onChange={e => setHotlineForm({...hotlineForm, category: e.target.value as any})}>
                            <option value="emergency">Emergency</option>
                            <option value="security">Security</option>
                            <option value="health">Health</option>
                            <option value="utility">Utility</option>
                        </select>
                    </div>
                  </>
              )}

              {activeTab === 'faqs' && (
                  <>
                     <div className="space-y-2">
                        <Label required>Question</Label>
                        <Input value={faqForm.question} onChange={e => setFaqForm({...faqForm, question: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label required>Answer</Label>
                        <Textarea value={faqForm.answer} onChange={e => setFaqForm({...faqForm, answer: e.target.value})} />
                    </div>
                  </>
              )}

              {activeTab === 'officials' && (
                  <>
                     <div className="space-y-2">
                        <Label required>Name</Label>
                        <Input value={officialForm.name} onChange={e => setOfficialForm({...officialForm, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label required>Position</Label>
                        <Input value={officialForm.position} onChange={e => setOfficialForm({...officialForm, position: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <FileUpload 
                            label="Official Photo"
                            value={officialForm.imageUrl} 
                            onChange={val => setOfficialForm({...officialForm, imageUrl: val})} 
                        />
                    </div>
                  </>
              )}

              <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit">Save</Button>
              </div>
          </form>
      </Modal>

      <ConfirmDialog 
        isOpen={deleteDialog.isOpen} 
        onClose={() => setDeleteDialog({isOpen: false, id: null})}
        onConfirm={handleDelete}
        title="Delete Item"
        description="Are you sure you want to delete this item?"
      />
    </div>
  );
};

export default AdminContent;