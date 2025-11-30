import React, { useEffect, useState } from "react";
import { Plus, Trash2, Newspaper, AlertCircle } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Textarea,
  Modal,
  ConfirmDialog,
  FileUpload,
} from "../components/UI";
import { api } from "../services/api";
import { NewsItem } from "../types";
import { useToast } from "../components/Toast";

const AdminNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    id: string | null;
  }>({ isOpen: false, id: null });
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    imageUrl: "",
    author: "Admin",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchNews = async () => {
    setLoading(true);
    try {
      const data = await api.getNews();
      setNews(data);
    } catch (error) {
      showToast("Error", "Failed to fetch news articles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim() || formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }
    if (formData.title.length > 150) {
      newErrors.title = "Title must not exceed 150 characters";
    }

    if (!formData.summary.trim() || formData.summary.length < 20) {
      newErrors.summary = "Summary must be at least 20 characters";
    }
    if (formData.summary.length > 300) {
      newErrors.summary = "Summary must not exceed 300 characters";
    }

    if (!formData.content.trim() || formData.content.length < 50) {
      newErrors.content = "Content must be at least 50 characters";
    }
    if (formData.content.length > 5000) {
      newErrors.content = "Content must not exceed 5000 characters";
    }

    if (!formData.imageUrl) {
      newErrors.imageUrl = "Please upload an article image";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showToast(
        "Validation Error",
        "Please fix the errors in the form",
        "error"
      );
      return;
    }

    setSubmitting(true);
    try {
      await api.createNews(formData);
      setShowModal(false);
      setFormData({
        title: "",
        summary: "",
        content: "",
        imageUrl: "",
        author: "Admin",
      });
      setErrors({});
      showToast("Success", "News article published successfully", "success");
      fetchNews();
    } catch (error: any) {
      showToast("Error", error.message || "Failed to publish article", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteDialog.id) {
      try {
        await api.deleteNews(deleteDialog.id);
        setDeleteDialog({ isOpen: false, id: null });
        showToast("Success", "Article deleted successfully", "success");
        fetchNews();
      } catch (error) {
        showToast("Error", "Failed to delete article", "error");
      }
    }
  };

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

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-500">Loading articles...</p>
        </div>
      ) : news.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No articles yet
            </h3>
            <p className="text-gray-500 mb-4">
              Start by creating your first news article
            </p>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add News Article
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {news.map((item) => (
            <Card
              key={item.id}
              className="flex flex-col md:flex-row overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="w-full md:w-48 h-48 md:h-auto bg-gray-200 relative">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {new Date(item.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    • By {item.author}
                  </p>
                  <p className="text-gray-600 line-clamp-2">{item.summary}</p>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() =>
                      setDeleteDialog({ isOpen: true, id: item.id })
                    }
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setFormData({
            title: "",
            summary: "",
            content: "",
            imageUrl: "",
            author: "Admin",
          });
          setErrors({});
        }}
        title="Create News Article"
        className="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label required>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: "" });
              }}
              placeholder="Enter article title"
              maxLength={150}
              error={errors.title}
            />
            <p className="text-xs text-gray-500">
              {formData.title.length}/150 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label required>Summary</Label>
            <Textarea
              value={formData.summary}
              onChange={(e) => {
                setFormData({ ...formData, summary: e.target.value });
                if (errors.summary) setErrors({ ...errors, summary: "" });
              }}
              placeholder="Brief summary for preview (20-300 characters)"
              className="min-h-[80px]"
              maxLength={300}
              error={errors.summary}
            />
            <p className="text-xs text-gray-500">
              {formData.summary.length}/300 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label required>Content</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => {
                setFormData({ ...formData, content: e.target.value });
                if (errors.content) setErrors({ ...errors, content: "" });
              }}
              placeholder="Full article content..."
              className="min-h-[200px]"
              maxLength={5000}
              error={errors.content}
            />
            <p className="text-xs text-gray-500">
              {formData.content.length}/5000 characters
            </p>
          </div>

          <div className="space-y-2">
            <FileUpload
              label="Article Image"
              value={formData.imageUrl}
              onChange={(val) => {
                setFormData({ ...formData, imageUrl: val });
                if (errors.imageUrl) setErrors({ ...errors, imageUrl: "" });
              }}
              helperText="Upload a featured image (JPG, PNG, max 5MB)"
            />
            {errors.imageUrl && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.imageUrl}
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Once published, this article will be
              visible to all residents on the News page.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowModal(false);
                setFormData({
                  title: "",
                  summary: "",
                  content: "",
                  imageUrl: "",
                  author: "Admin",
                });
                setErrors({});
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Publishing..." : "Publish Article"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Article"
        description="Are you sure you want to delete this news article? This action cannot be undone and the article will be removed from all users' feeds."
        confirmText="Delete Article"
      />
    </div>
  );
};

export default AdminNews;
