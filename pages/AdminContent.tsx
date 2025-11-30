import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Phone,
  HelpCircle,
  Users,
  AlertCircle,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Textarea,
  Modal,
  ConfirmDialog,
  Tabs,
  Badge,
  FileUpload,
  Select,
} from "../components/UI";
import { api } from "../services/api";
import { Hotline, FAQ, Official } from "../types";
import { useToast } from "../components/Toast";

const AdminContent = () => {
  const [activeTab, setActiveTab] = useState("hotlines");

  // Data
  const [hotlines, setHotlines] = useState<Hotline[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    id: string | null;
  }>({ isOpen: false, id: null });
  const { showToast } = useToast();

  // Forms
  const [hotlineForm, setHotlineForm] = useState({
    name: "",
    number: "",
    category: "emergency" as const,
  });
  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    category: "General",
  });
  const [officialForm, setOfficialForm] = useState({
    name: "",
    position: "",
    imageUrl: "",
    contact: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "hotlines") setHotlines(await api.getHotlines());
      if (activeTab === "faqs") setFaqs(await api.getFAQs());
      if (activeTab === "officials") setOfficials(await api.getOfficials());
    } catch (error) {
      showToast("Error", `Failed to fetch ${activeTab}`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const validateHotline = () => {
    const newErrors: Record<string, string> = {};

    if (!hotlineForm.name.trim() || hotlineForm.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }
    if (hotlineForm.name.length > 100) {
      newErrors.name = "Name must not exceed 100 characters";
    }

    // Philippine phone number validation (various formats)
    const phoneRegex = /^(\+63|0)?[0-9]{10}$/;
    const cleanNumber = hotlineForm.number.replace(/[\s\-()]/g, "");
    if (!cleanNumber || !phoneRegex.test(cleanNumber)) {
      newErrors.number = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateFAQ = () => {
    const newErrors: Record<string, string> = {};

    if (!faqForm.question.trim() || faqForm.question.length < 10) {
      newErrors.question = "Question must be at least 10 characters";
    }
    if (faqForm.question.length > 300) {
      newErrors.question = "Question must not exceed 300 characters";
    }

    if (!faqForm.answer.trim() || faqForm.answer.length < 20) {
      newErrors.answer = "Answer must be at least 20 characters";
    }
    if (faqForm.answer.length > 1000) {
      newErrors.answer = "Answer must not exceed 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOfficial = () => {
    const newErrors: Record<string, string> = {};

    if (!officialForm.name.trim() || officialForm.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }
    if (officialForm.name.length > 100) {
      newErrors.name = "Name must not exceed 100 characters";
    }

    if (!officialForm.position.trim() || officialForm.position.length < 3) {
      newErrors.position = "Position must be at least 3 characters";
    }
    if (officialForm.position.length > 100) {
      newErrors.position = "Position must not exceed 100 characters";
    }

    if (!officialForm.imageUrl) {
      newErrors.imageUrl = "Please upload a photo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let isValid = false;
    if (activeTab === "hotlines") isValid = validateHotline();
    if (activeTab === "faqs") isValid = validateFAQ();
    if (activeTab === "officials") isValid = validateOfficial();

    if (!isValid) {
      showToast(
        "Validation Error",
        "Please fix the errors in the form",
        "error"
      );
      return;
    }

    setSubmitting(true);
    try {
      if (activeTab === "hotlines") await api.createHotline(hotlineForm);
      if (activeTab === "faqs") await api.createFAQ(faqForm);
      if (activeTab === "officials") await api.createOfficial(officialForm);

      setShowModal(false);
      // Reset forms
      setHotlineForm({ name: "", number: "", category: "emergency" });
      setFaqForm({ question: "", answer: "", category: "General" });
      setOfficialForm({ name: "", position: "", imageUrl: "", contact: "" });
      setErrors({});
      showToast(
        "Success",
        `${
          activeTab === "hotlines"
            ? "Hotline"
            : activeTab === "faqs"
            ? "FAQ"
            : "Official"
        } added successfully`,
        "success"
      );
      fetchData();
    } catch (error: any) {
      showToast("Error", error.message || "Failed to add item", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteDialog.id) {
      try {
        if (activeTab === "hotlines") await api.deleteHotline(deleteDialog.id);
        if (activeTab === "faqs") await api.deleteFAQ(deleteDialog.id);
        if (activeTab === "officials")
          await api.deleteOfficial(deleteDialog.id);

        setDeleteDialog({ isOpen: false, id: null });
        showToast("Success", "Item deleted successfully", "success");
        fetchData();
      } catch (error) {
        showToast("Error", "Failed to delete item", "error");
      }
    }
  };

  const getEmptyState = () => {
    const states = {
      hotlines: {
        icon: Phone,
        title: "No hotlines yet",
        desc: "Add emergency contact numbers",
      },
      faqs: {
        icon: HelpCircle,
        title: "No FAQs yet",
        desc: "Add frequently asked questions",
      },
      officials: {
        icon: Users,
        title: "No officials yet",
        desc: "Add barangay officials",
      },
    };
    const state = states[activeTab as keyof typeof states];
    const Icon = state.icon;

    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {state.title}
          </h3>
          <p className="text-gray-500 mb-4">{state.desc}</p>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Content Management
          </h1>
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
          { id: "hotlines", label: "Emergency Hotlines" },
          { id: "faqs", label: "FAQs / Help" },
          { id: "officials", label: "Barangay Officials" },
        ]}
      />

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-500">Loading...</p>
          </div>
        ) : (
          <>
            {activeTab === "hotlines" &&
              (hotlines.length === 0
                ? getEmptyState()
                : hotlines.map((h) => (
                    <Card
                      key={h.id}
                      className="p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-50 rounded-lg text-red-600">
                          <Phone size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{h.name}</h3>
                          <p className="text-sm text-gray-600">{h.number}</p>
                          <Badge
                            variant="danger"
                            className="mt-1 uppercase text-[10px]"
                          >
                            {h.category}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() =>
                          setDeleteDialog({ isOpen: true, id: h.id })
                        }
                      >
                        <Trash2 size={16} />
                      </Button>
                    </Card>
                  )))}

            {activeTab === "faqs" &&
              (faqs.length === 0
                ? getEmptyState()
                : faqs.map((f) => (
                    <Card
                      key={f.id}
                      className="p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-2">
                            <HelpCircle
                              size={20}
                              className="text-blue-500 mt-0.5 flex-shrink-0"
                            />
                            <h3 className="font-bold text-gray-900">
                              {f.question}
                            </h3>
                          </div>
                          <p className="text-gray-600 text-sm ml-7">
                            {f.answer}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 flex-shrink-0"
                          onClick={() =>
                            setDeleteDialog({ isOpen: true, id: f.id })
                          }
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </Card>
                  )))}

            {activeTab === "officials" &&
              (officials.length === 0
                ? getEmptyState()
                : officials.map((o) => (
                    <Card
                      key={o.id}
                      className="p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={o.imageUrl}
                          alt={o.name}
                          className="w-16 h-16 rounded-full object-cover bg-gray-200 border-2 border-gray-100"
                        />
                        <div>
                          <h3 className="font-bold text-gray-900">{o.name}</h3>
                          <p className="text-sm text-gray-600">{o.position}</p>
                          {o.contact && (
                            <p className="text-xs text-gray-500 mt-1">
                              {o.contact}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() =>
                          setDeleteDialog({ isOpen: true, id: o.id })
                        }
                      >
                        <Trash2 size={16} />
                      </Button>
                    </Card>
                  )))}
          </>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setHotlineForm({ name: "", number: "", category: "emergency" });
          setFaqForm({ question: "", answer: "", category: "General" });
          setOfficialForm({
            name: "",
            position: "",
            imageUrl: "",
            contact: "",
          });
          setErrors({});
        }}
        title={`Add ${
          activeTab === "hotlines"
            ? "Hotline"
            : activeTab === "faqs"
            ? "FAQ"
            : "Official"
        }`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === "hotlines" && (
            <>
              <div className="space-y-2">
                <Label required>Name</Label>
                <Input
                  value={hotlineForm.name}
                  onChange={(e) => {
                    setHotlineForm({ ...hotlineForm, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  placeholder="e.g., Police Emergency, Fire Department"
                  maxLength={100}
                  error={errors.name}
                />
                <p className="text-xs text-gray-500">
                  {hotlineForm.name.length}/100 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label required>Number</Label>
                <Input
                  value={hotlineForm.number}
                  onChange={(e) => {
                    setHotlineForm({ ...hotlineForm, number: e.target.value });
                    if (errors.number) setErrors({ ...errors, number: "" });
                  }}
                  placeholder="e.g., 911, 0912-345-6789"
                  error={errors.number}
                />
                <p className="text-xs text-gray-500">
                  Enter a valid phone number
                </p>
              </div>
              <div className="space-y-2">
                <Label required>Category</Label>
                <Select
                  value={hotlineForm.category}
                  onChange={(e) =>
                    setHotlineForm({
                      ...hotlineForm,
                      category: e.target.value as any,
                    })
                  }
                >
                  <option value="emergency">Emergency</option>
                  <option value="security">Security</option>
                  <option value="health">Health</option>
                  <option value="utility">Utility</option>
                  <option value="official">Official</option>
                </Select>
              </div>
            </>
          )}

          {activeTab === "faqs" && (
            <>
              <div className="space-y-2">
                <Label required>Question</Label>
                <Input
                  value={faqForm.question}
                  onChange={(e) => {
                    setFaqForm({ ...faqForm, question: e.target.value });
                    if (errors.question) setErrors({ ...errors, question: "" });
                  }}
                  placeholder="What is the question?"
                  maxLength={300}
                  error={errors.question}
                />
                <p className="text-xs text-gray-500">
                  {faqForm.question.length}/300 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label required>Answer</Label>
                <Textarea
                  value={faqForm.answer}
                  onChange={(e) => {
                    setFaqForm({ ...faqForm, answer: e.target.value });
                    if (errors.answer) setErrors({ ...errors, answer: "" });
                  }}
                  placeholder="Provide a clear and helpful answer..."
                  className="min-h-[120px]"
                  maxLength={1000}
                  error={errors.answer}
                />
                <p className="text-xs text-gray-500">
                  {faqForm.answer.length}/1000 characters
                </p>
              </div>
            </>
          )}

          {activeTab === "officials" && (
            <>
              <div className="space-y-2">
                <Label required>Name</Label>
                <Input
                  value={officialForm.name}
                  onChange={(e) => {
                    setOfficialForm({ ...officialForm, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  placeholder="e.g., Juan Dela Cruz"
                  maxLength={100}
                  error={errors.name}
                />
                <p className="text-xs text-gray-500">
                  {officialForm.name.length}/100 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label required>Position</Label>
                <Input
                  value={officialForm.position}
                  onChange={(e) => {
                    setOfficialForm({
                      ...officialForm,
                      position: e.target.value,
                    });
                    if (errors.position) setErrors({ ...errors, position: "" });
                  }}
                  placeholder="e.g., Barangay Captain, Kagawad"
                  maxLength={100}
                  error={errors.position}
                />
                <p className="text-xs text-gray-500">
                  {officialForm.position.length}/100 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label>Contact (Optional)</Label>
                <Input
                  value={officialForm.contact}
                  onChange={(e) =>
                    setOfficialForm({
                      ...officialForm,
                      contact: e.target.value,
                    })
                  }
                  placeholder="e.g., 0912-345-6789"
                />
              </div>
              <div className="space-y-2">
                <FileUpload
                  label="Official Photo"
                  value={officialForm.imageUrl}
                  onChange={(val) => {
                    setOfficialForm({ ...officialForm, imageUrl: val });
                    if (errors.imageUrl) setErrors({ ...errors, imageUrl: "" });
                  }}
                  helperText="Upload a professional photo (JPG, PNG, max 5MB)"
                />
                {errors.imageUrl && (
                  <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.imageUrl}
                  </p>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowModal(false);
                setHotlineForm({ name: "", number: "", category: "emergency" });
                setFaqForm({ question: "", answer: "", category: "General" });
                setOfficialForm({
                  name: "",
                  position: "",
                  imageUrl: "",
                  contact: "",
                });
                setErrors({});
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
};

export default AdminContent;
