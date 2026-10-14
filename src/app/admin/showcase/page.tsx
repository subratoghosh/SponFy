"use client";

import React, { useState, useEffect } from "react";
import { ShowcaseCompany } from "@/types";
import {
  Building2,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Check,
} from "lucide-react";
import Image from "next/image";

export default function AdminShowcasePage() {
  const [companies, setCompanies] = useState<ShowcaseCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<ShowcaseCompany | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    websiteUrl: "",
    logoUrl: "",
    industry: "",
    shortDescription: "",
    isVisible: true,
    isPartner: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Dialog State
  const [companyToDelete, setCompanyToDelete] = useState<ShowcaseCompany | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Companies
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/showcase");
      if (!res.ok) {
        throw new Error("Failed to load showcase companies");
      }
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCompanies(json.data);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingCompany(null);
    setFormData({
      name: "",
      websiteUrl: "https://",
      logoUrl: "",
      industry: "",
      shortDescription: "",
      isVisible: true,
      isPartner: false,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (company: ShowcaseCompany) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      websiteUrl: company.websiteUrl,
      logoUrl: company.logoUrl || "",
      industry: company.industry,
      shortDescription: company.shortDescription,
      isVisible: company.isVisible,
      isPartner: !!company.isPartner,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Submit Add/Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Client-side quick checks
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Company name is required";
    if (!formData.websiteUrl.trim().startsWith("http")) errors.websiteUrl = "Must be a valid URL starting with http:// or https://";
    if (formData.logoUrl && !formData.logoUrl.startsWith("https://")) {
      errors.logoUrl = "Logo URL must use https:// protocol";
    }
    if (!formData.industry.trim()) errors.industry = "Industry is required";
    if (!formData.shortDescription.trim() || formData.shortDescription.length < 10) {
      errors.shortDescription = "Description must be at least 10 characters";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      const url = editingCompany
        ? `/api/admin/showcase/${editingCompany.id}`
        : "/api/admin/showcase";
      const method = editingCompany ? "PATCH" : "POST";

      const payload = {
        name: formData.name.trim(),
        websiteUrl: formData.websiteUrl.trim(),
        logoUrl: formData.logoUrl.trim() || null,
        industry: formData.industry.trim(),
        shortDescription: formData.shortDescription.trim(),
        isVisible: formData.isVisible,
        isPartner: formData.isPartner,
        sortOrder: editingCompany ? editingCompany.sortOrder : companies.length,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        if (json.details) {
          const flat: Record<string, string> = {};
          Object.entries(json.details).forEach(([k, v]: [string, any]) => {
            flat[k] = Array.isArray(v) ? v[0] : String(v);
          });
          setFormErrors(flat);
        }
        throw new Error(json.error || "Failed to save company");
      }

      setIsModalOpen(false);
      showSuccess(editingCompany ? "Company updated successfully" : "Company added to showcase");
      await fetchCompanies();
    } catch (err: any) {
      setError(err?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Visibility
  const handleToggleVisibility = async (company: ShowcaseCompany) => {
    try {
      const nextVisible = !company.isVisible;
      const res = await fetch(`/api/admin/showcase/${company.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: nextVisible }),
      });
      if (!res.ok) throw new Error("Failed to update visibility");
      setCompanies((prev) =>
        prev.map((c) => (c.id === company.id ? { ...c, isVisible: nextVisible } : c))
      );
      showSuccess(`"${company.name}" is now ${nextVisible ? "visible" : "hidden"}`);
    } catch (err: any) {
      setError(err?.message || "Toggle visibility failed");
    }
  };

  // Delete Company
  const handleConfirmDelete = async () => {
    if (!companyToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/showcase/${companyToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete company");
      setCompanies((prev) => prev.filter((c) => c.id !== companyToDelete.id));
      showSuccess(`Deleted "${companyToDelete.name}"`);
      setCompanyToDelete(null);
    } catch (err: any) {
      setError(err?.message || "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  // Reorder Company (Up/Down)
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= companies.length) return;

    const next = [...companies];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;

    const updated = next.map((item, idx) => ({ ...item, sortOrder: idx }));
    setCompanies(updated);

    try {
      const res = await fetch("/api/admin/showcase/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: updated.map((c) => c.id) }),
      });
      if (!res.ok) throw new Error("Reorder failed");
      showSuccess("Order updated and published");
    } catch (err: any) {
      setError(err?.message || "Failed to save order");
      await fetchCompanies(); // Revert
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#0C382E]/10">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#0C382E]" />
            <h1 className="text-2xl font-bold font-fraunces text-[#0C382E]">
              Showcase Companies
            </h1>
          </div>
          <p className="text-sm text-[#0C382E]/70 mt-1">
            Manage the companies featured in the public landing page showcase carousel.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0C382E] text-[#FEE790] font-semibold text-sm hover:bg-[#0C382E]/90 transition shadow-sm min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Company</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs font-semibold text-rose-700 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#0C382E]/60">
          <Loader2 className="w-8 h-8 animate-spin text-[#0C382E]" />
          <p className="text-sm font-medium">Loading showcase companies...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-[#0C382E]/10 p-8 shadow-sm">
          <Building2 className="w-12 h-12 text-[#0C382E]/30 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#0C382E]">No showcase companies found</h3>
          <p className="text-sm text-[#0C382E]/60 max-w-md mx-auto mt-1 mb-6">
            Get started by adding companies that attendees and sponsors can explore on the landing page.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0C382E] text-[#FEE790] text-sm font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add First Company
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block bg-white rounded-2xl border border-[#0C382E]/10 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-[#0C382E]">
              <thead className="bg-[#FAF4E6]/70 border-b border-[#0C382E]/10 text-xs font-bold text-[#0C382E]/70 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5 w-16 text-center">Order</th>
                  <th className="px-4 py-3.5">Company</th>
                  <th className="px-4 py-3.5">Industry</th>
                  <th className="px-4 py-3.5">Description</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0C382E]/5">
                {companies.map((company, index) => {
                  const initials = company.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={company.id}
                      className="hover:bg-[#FAF4E6]/30 transition group"
                    >
                      {/* Order Controls */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            disabled={index === 0}
                            onClick={() => handleMove(index, "up")}
                            title="Move Up"
                            aria-label={`Move ${company.name} up`}
                            className="p-1 rounded hover:bg-[#0C382E]/10 text-[#0C382E]/60 disabled:opacity-20 disabled:hover:bg-transparent"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-xs font-semibold w-4 text-center">
                            {index + 1}
                          </span>
                          <button
                            disabled={index === companies.length - 1}
                            onClick={() => handleMove(index, "down")}
                            title="Move Down"
                            aria-label={`Move ${company.name} down`}
                            className="p-1 rounded hover:bg-[#0C382E]/10 text-[#0C382E]/60 disabled:opacity-20 disabled:hover:bg-transparent"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Company Info */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#0C382E]/5 border border-[#0C382E]/10 flex items-center justify-center font-bold text-xs text-[#0C382E] shrink-0 overflow-hidden">
                            {company.logoUrl ? (
                              <Image
                                src={company.logoUrl}
                                alt={company.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{initials}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#0C382E] truncate">
                                {company.name}
                              </span>
                              {company.isPartner && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FEE790] text-[#0C382E] border border-[#0C382E]/10">
                                  <Check className="w-2.5 h-2.5" />
                                  Partner
                                </span>
                              )}
                            </div>
                            <a
                              href={company.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#0C382E]/60 hover:text-[#0C382E] inline-flex items-center gap-1 mt-0.5"
                            >
                              <span>{company.websiteUrl.replace(/^https?:\/\//, "")}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Industry */}
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-[#0C382E]/5 text-[#0C382E] border border-[#0C382E]/10">
                          {company.industry}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="text-xs text-[#0C382E]/80 line-clamp-2">
                          {company.shortDescription}
                        </p>
                      </td>

                      {/* Visibility Status */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => handleToggleVisibility(company)}
                          title={company.isVisible ? "Click to hide" : "Click to publish"}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                            company.isVisible
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {company.isVisible ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Visible</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(company)}
                            title="Edit"
                            aria-label={`Edit ${company.name}`}
                            className="p-1.5 rounded-lg text-[#0C382E]/70 hover:text-[#0C382E] hover:bg-[#0C382E]/5 transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setCompanyToDelete(company)}
                            title="Delete"
                            aria-label={`Delete ${company.name}`}
                            className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (< 768px) */}
          <div className="md:hidden space-y-3">
            {companies.map((company, index) => {
              const initials = company.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={company.id}
                  className="bg-white rounded-2xl border border-[#0C382E]/10 p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0C382E]/5 border border-[#0C382E]/10 flex items-center justify-center font-bold text-xs text-[#0C382E] shrink-0 overflow-hidden">
                        {company.logoUrl ? (
                          <Image
                            src={company.logoUrl}
                            alt={company.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{initials}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-[#0C382E]">{company.name}</h4>
                          {company.isPartner && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FEE790] text-[#0C382E]">
                              Partner
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-[#0C382E]/60">{company.industry}</span>
                      </div>
                    </div>

                    {/* Order Controls */}
                    <div className="flex items-center gap-1 bg-[#FAF4E6] p-1 rounded-lg">
                      <button
                        disabled={index === 0}
                        onClick={() => handleMove(index, "up")}
                        className="p-1 text-[#0C382E]/70 disabled:opacity-20"
                        aria-label={`Move ${company.name} up`}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-mono font-bold w-4 text-center">
                        {index + 1}
                      </span>
                      <button
                        disabled={index === companies.length - 1}
                        onClick={() => handleMove(index, "down")}
                        className="p-1 text-[#0C382E]/70 disabled:opacity-20"
                        aria-label={`Move ${company.name} down`}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#0C382E]/80">
                    {company.shortDescription}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#0C382E]/5 text-xs">
                    <button
                      onClick={() => handleToggleVisibility(company)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold ${
                        company.isVisible
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {company.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{company.isVisible ? "Visible" : "Hidden"}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(company)}
                        className="px-3 py-1.5 rounded-lg bg-[#FAF4E6] text-[#0C382E] font-medium hover:bg-[#FAF4E6]/80 flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setCompanyToDelete(company)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                        aria-label={`Delete ${company.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#0C382E]/10 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#0C382E]/10">
              <h3 className="text-lg font-bold font-fraunces text-[#0C382E]">
                {editingCompany ? "Edit Showcase Company" : "Add Showcase Company"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#0C382E]/50 hover:text-[#0C382E] hover:bg-[#0C382E]/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-[#0C382E] uppercase mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Acme Cloud"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#0C382E]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C382E]/20"
                />
                {formErrors.name && (
                  <p className="text-xs text-rose-600 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-xs font-bold text-[#0C382E] uppercase mb-1">
                  Website URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#0C382E]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C382E]/20"
                />
                {formErrors.websiteUrl && (
                  <p className="text-xs text-rose-600 mt-1">{formErrors.websiteUrl}</p>
                )}
              </div>

              {/* Logo URL */}
              <div>
                <label className="block text-xs font-bold text-[#0C382E] uppercase mb-1">
                  Logo URL (Optional https URL)
                </label>
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#0C382E]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C382E]/20"
                />
                <p className="text-[11px] text-[#0C382E]/50 mt-1">
                  Leaves fallback to initials avatar if blank.
                </p>
                {formErrors.logoUrl && (
                  <p className="text-xs text-rose-600 mt-1">{formErrors.logoUrl}</p>
                )}
              </div>

              {/* Industry */}
              <div>
                <label className="block text-xs font-bold text-[#0C382E] uppercase mb-1">
                  Industry *
                </label>
                <input
                  type="text"
                  required
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g. Developer Tools, Fintech"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#0C382E]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C382E]/20"
                />
                {formErrors.industry && (
                  <p className="text-xs text-rose-600 mt-1">{formErrors.industry}</p>
                )}
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold text-[#0C382E] uppercase mb-1">
                  Short Description (10-300 chars) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Describe why sponsors or campaign organizers approach this company..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#0C382E]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C382E]/20"
                />
                {formErrors.shortDescription && (
                  <p className="text-xs text-rose-600 mt-1">{formErrors.shortDescription}</p>
                )}
              </div>

              {/* Toggles */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0C382E] focus:ring-[#0C382E]"
                  />
                  <span className="text-xs font-semibold text-[#0C382E]">
                    Visible on landing page
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPartner}
                    onChange={(e) => setFormData({ ...formData, isPartner: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0C382E] focus:ring-[#0C382E]"
                  />
                  <span className="text-xs font-semibold text-[#0C382E]">
                    Official Partner badge
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#0C382E]/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#0C382E]/70 hover:bg-[#FAF4E6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#0C382E] text-[#FEE790] text-sm font-semibold hover:bg-[#0C382E]/90 disabled:opacity-50 flex items-center gap-2 shadow-sm min-h-[44px]"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingCompany ? "Save Changes" : "Create Company"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {companyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#0C382E]/10 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-50">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#0C382E]">Delete Showcase Company</h3>
            </div>

            <p className="text-sm text-[#0C382E]/70 leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-[#0C382E] font-semibold">{companyToDelete.name}</strong>?
              This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setCompanyToDelete(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#0C382E]/70 hover:bg-[#FAF4E6]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Delete Company</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
