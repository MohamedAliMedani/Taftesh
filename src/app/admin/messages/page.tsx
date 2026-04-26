"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, User, Mail, Phone, Calendar, CheckCircle2 } from "lucide-react";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contact")
      .then((r) => r.json())
      .then((data) => { setMessages(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold outfit">رسائل التواصل</h1>
        <p className="text-muted-foreground mt-1">رسائل العملاء من نموذج التواصل ({messages.length} رسالة)</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card h-32 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="glass-card p-16 text-center rounded-3xl">
          <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground">لا توجد رسائل حالياً</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-6 rounded-2xl border-white/5 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="font-bold">{msg.name}</div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {msg.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {msg.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(msg.createdAt).toLocaleString("ar-EG")}
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl text-sm leading-relaxed border border-white/5">
                {msg.message}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
