"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, Search, Shield, UserCheck, UserX, Phone, Mail, Calendar, Filter } from "lucide-react";

export default function AdminUsersPage() {
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
        setMessage("تم التحديث بنجاح");
        fetchUsers();
      }
    } catch {
      setMessage("حدث خطأ");
    }
    setTimeout(() => setMessage(""), 2000);
  };

  const roleLabels: Record<string, string> = {
    CLIENT: "عميل",
    EXPERT: "خبير",
    ADMIN: "مدير",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold outfit">إدارة المستخدمين</h1>
        <p className="text-muted-foreground mt-1">عرض وإدارة حسابات المستخدمين ({total} مستخدم)</p>
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
            placeholder="بحث بالاسم أو رقم الهاتف..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent w-full py-3 text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="glass px-4 py-3 rounded-xl text-sm border border-white/10 bg-transparent text-white [&>option]:text-black"
          >
            <option value="">كل الأدوار</option>
            <option value="CLIENT">عملاء</option>
            <option value="EXPERT">خبراء</option>
            <option value="ADMIN">مديرين</option>
          </select>
        </div>
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
                  <th className="text-right p-4 text-xs text-muted-foreground font-medium">المستخدم</th>
                  <th className="text-right p-4 text-xs text-muted-foreground font-medium">التواصل</th>
                  <th className="text-right p-4 text-xs text-muted-foreground font-medium">الدور</th>
                  <th className="text-right p-4 text-xs text-muted-foreground font-medium">الحالة</th>
                  <th className="text-right p-4 text-xs text-muted-foreground font-medium">التاريخ</th>
                  <th className="text-right p-4 text-xs text-muted-foreground font-medium">إجراءات</th>
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
                          <div className="font-medium">{user.name || "بدون اسم"}</div>
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
                        {user.specialty && ` - ${user.specialty === "ENGINEER" ? "مهندس" : "محامي"}`}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {user.role === "EXPERT" && (
                          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            user.verified ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"
                          }`}>
                            {user.verified ? "معتمد" : "غير معتمد"}
                          </span>
                        )}
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          user.active !== false ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                        }`}>
                          {user.active !== false ? "نشط" : "معطل"}
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
                            title="اعتماد"
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
                            title={user.active !== false ? "تعطيل" : "تفعيل"}
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
                السابق
              </button>
              <span className="text-sm text-muted-foreground">
                صفحة {page} من {Math.ceil(total / 20)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * 20 >= total}
                className="px-3 py-1 rounded-lg text-sm glass disabled:opacity-30"
              >
                التالي
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
