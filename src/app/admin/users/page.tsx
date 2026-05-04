"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, Search, Shield, UserCheck, UserX, Phone, Mail, Calendar, Filter } from "lucide-react";
import Dropdown from "@/components/ui/Dropdown";
import { useT } from "@/lib/i18n";

export default function AdminUsersPage() {
  const t = useT();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [message, setMessage] = useState("");

  const fetchUsers = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.data || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleUpdate = async (userId: string, updates: Record<string, any>) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updates }),
      });
      if (res.ok) {
        setMessage(t("admin.users.updated"));
        fetchUsers();
      }
    } catch {
      setMessage(t("common.error"));
    }
    setTimeout(() => setMessage(""), 2000);
  };

  const roleLabels: Record<string, string> = {
    CLIENT: t("admin.users.client"),
    EXPERT: t("admin.users.expert"),
    ADMIN: t("admin.users.admin"),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold outfit">{t("admin.users.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("admin.users.subtitle", { total: String(total) })}</p>
      </div>

      {message && (
        <div className="bg-green-500/10 text-green-400 border border-green-500/20 p-3 rounded-xl text-sm">{message}</div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 glass flex items-center px-4 rounded-xl border border-white/10">
          <Search className="w-4 h-4 text-muted-foreground ml-2" />
          <input
            type="text"
            placeholder={t("admin.users.searchPlaceholder")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent w-full py-3 text-sm outline-none"
          />
        </div>
        <Dropdown
          value={roleFilter}
          onChange={(v) => { setRoleFilter(v); setPage(1); }}
          placeholder={t("admin.users.allRoles")}
          icon={<Filter className="w-4 h-4 text-muted-foreground" />}
          allowClear
          options={[
            { value: "CLIENT", label: t("admin.users.clients") },
            { value: "EXPERT", label: t("admin.users.experts") },
            { value: "ADMIN", label: t("admin.users.admins") },
          ]}
          className="min-w-[160px]"
        />
      </div>

      {/* Users table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card h-16 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-right p-4 text-xs text-muted-foreground font-medium">{t("admin.users.user")}</th>
                  <th className="text-right p-4 text-xs text-muted-foreground font-medium">{t("admin.users.contact")}</th>
                  <th className="text-right p-4 text-xs text-muted-foreground font-medium">{t("admin.users.role")}</th>
                  <th className="text-right p-4 text-xs text-muted-foreground font-medium">{t("admin.users.status")}</th>
                  <th className="text-right p-4 text-xs text-muted-foreground font-medium">{t("admin.users.date")}</th>
                  <th className="text-right p-4 text-xs text-muted-foreground font-medium">{t("admin.users.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-amber-500/10 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <div className="font-medium">{user.name || t("admin.users.noName")}</div>
                          <div className="text-xs text-muted-foreground font-mono">#{user.id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {user.phone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" /> {user.phone}
                          </div>
                        )}
                        {user.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" /> {user.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                        user.role === "ADMIN" ? "bg-red-500/10 text-red-400" :
                        user.role === "EXPERT" ? "bg-emerald-500/10 text-emerald-400" :
                        "bg-blue-500/10 text-blue-400"
                      }`}>
                        {roleLabels[user.role] || user.role}
                        {user.specialty && ` - ${user.specialty === "ENGINEER" ? t("common.engineer") : t("common.lawyer")}`}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {user.role === "EXPERT" && (
                          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            user.verified ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"
                          }`}>
                            {user.verified ? t("admin.users.verified") : t("admin.users.notVerified")}
                          </span>
                        )}
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          user.active !== false ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                        }`}>
                          {user.active !== false ? t("admin.users.active") : t("admin.users.disabled")}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(user.createdAt).toLocaleDateString("ar-EG")}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {user.role === "EXPERT" && !user.verified && (
                          <button
                            onClick={() => handleUpdate(user.id, { verified: true })}
                            className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                            title={t("admin.providers.approve")}
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        {user.role !== "ADMIN" && (
                          <button
                            onClick={() => handleUpdate(user.id, { active: user.active === false })}
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.active !== false
                                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                            }`}
                            title={user.active !== false ? t("admin.users.disabled") : t("admin.users.active")}
                          >
                            {user.active !== false ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-white/5">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-lg text-sm glass disabled:opacity-30"
              >
                {t("admin.users.previous")}
              </button>
              <span className="text-sm text-muted-foreground">
                {t("admin.users.pageOf", { page: String(page), total: String(Math.ceil(total / 20)) })}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * 20 >= total}
                className="px-3 py-1 rounded-lg text-sm glass disabled:opacity-30"
              >
                {t("admin.users.next")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
