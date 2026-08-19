"use client";

import { useState, useEffect } from "react";

interface User {
  id: number;
  email: string;
  name: string;
  plan: string;
  calculationsUsed: number;
  isAdmin: boolean;
  createdAt: string;
}

interface Payment {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  amount: number;
  plan: string;
  status: string;
  paymentMethod: string | null;
  referenceNumber: string | null;
  expiresAt: string;
  createdAt: string;
  paidAt: string | null;
  rejectedReason: string | null;
}

interface Stats {
  totalUsers: number;
  freeUsers: number;
  monthlyUsers: number;
  lifetimeUsers: number;
  totalRevenue: number;
  pendingPayments: number;
}

interface AuditLog {
  id: number;
  action: string;
  targetType: string | null;
  targetId: number | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "users" | "payments" | "audit" | "settings">("overview");
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      verifyAdmin(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyAdmin = async (token: string) => {
    try {
      const res = await fetch("/api/admin/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setIsAdmin(true);
        loadData();
      } else {
        localStorage.removeItem("admin_token");
      }
    } catch {
      localStorage.removeItem("admin_token");
    }
    setLoading(false);
  };

  const login = async () => {
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: adminPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("admin_token", data.token);
      setIsAdmin(true);
      loadData();
    } else {
      setError(data.error || "Invalid password");
    }
  };

  const loadData = async () => {
    const token = localStorage.getItem("admin_token");
    const headers = { Authorization: `Bearer ${token}` };

    const [usersRes, paymentsRes, statsRes, auditRes] = await Promise.all([
      fetch("/api/admin/users", { headers }),
      fetch("/api/admin/payments", { headers }),
      fetch("/api/admin/stats", { headers }),
      fetch("/api/admin/audit", { headers }),
    ]);

    if (usersRes.ok) setUsers((await usersRes.json()).users);
    if (paymentsRes.ok) setPayments((await paymentsRes.json()).payments);
    if (statsRes.ok) setStats((await statsRes.json()).stats);
    if (auditRes.ok) setAuditLogs((await auditRes.json()).logs || []);
  };

  const updateUserPlan = async (userId: number, plan: string) => {
    if (!confirm(`Are you sure you want to change this user's plan to ${plan.toUpperCase()}?`)) return;
    const token = localStorage.getItem("admin_token");
    await fetch("/api/admin/users/update", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId, plan }),
    });
    loadData();
  };

  const handlePayment = async (paymentId: number, action: "confirm" | "reject") => {
    let reason = "";
    if (action === "reject") {
      reason = prompt("Enter rejection reason (optional):") || "";
    } else {
      if (!confirm("Are you sure you want to confirm this payment? This will upgrade the user's account.")) return;
    }

    setActionLoading(paymentId);
    const token = localStorage.getItem("admin_token");
    await fetch("/api/admin/payments/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ paymentId, action, reason }),
    });
    setActionLoading(null);
    loadData();
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setIsAdmin(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "rejected": return "bg-red-100 text-red-700";
      case "expired": return "bg-gray-100 text-gray-500";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <span className="text-5xl">🔐</span>
            <h1 className="text-2xl font-bold mt-4">Admin Login</h1>
            <p className="text-gray-500 mt-2">Enter your admin password</p>
          </div>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Admin Password"
          />
          <button
            onClick={login}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Login to Dashboard
          </button>
          <a href="/" className="block text-center mt-4 text-sm text-gray-500 hover:text-blue-600">
            ← Back to App
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-xs text-gray-400">AgentCalc Pro</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={loadData} className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
              🔄 Refresh
            </button>
            <a href="/" className="text-sm text-gray-400 hover:text-white">View App →</a>
            <button onClick={logout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm transition">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: "overview", label: "📊 Overview" },
              { id: "users", label: "👥 Users" },
              { id: "payments", label: "💰 Payments" },
              { id: "audit", label: "📋 Audit Log" },
              { id: "settings", label: "⚙️ Settings" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as typeof tab)}
                className={`px-6 py-4 font-medium text-sm transition whitespace-nowrap ${
                  tab === t.id ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {tab === "overview" && stats && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalUsers}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <p className="text-gray-500 text-sm">Free Users</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats.freeUsers}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <p className="text-gray-500 text-sm">Paid Users</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.monthlyUsers + stats.lifetimeUsers}</p>
                <p className="text-xs text-gray-400 mt-1">{stats.monthlyUsers} monthly, {stats.lifetimeUsers} lifetime</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border bg-gradient-to-r from-green-50 to-emerald-50">
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600 mt-1">₱{(stats.totalRevenue / 100).toLocaleString()}</p>
              </div>
            </div>

            {/* Pending Payments Alert */}
            {stats.pendingPayments > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-4">
                <span className="text-3xl">⚠️</span>
                <div>
                  <p className="font-semibold text-yellow-800">{stats.pendingPayments} pending payment(s) need attention</p>
                  <p className="text-sm text-yellow-600">Review and confirm payments to upgrade users</p>
                </div>
                <button onClick={() => setTab("payments")} className="ml-auto bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm">
                  Review Payments
                </button>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="font-semibold text-gray-800 mb-4">User Plans Distribution</h3>
                <div className="space-y-3">
                  {[
                    { label: "Free", count: stats.freeUsers, color: "bg-gray-500" },
                    { label: "Monthly", count: stats.monthlyUsers, color: "bg-blue-500" },
                    { label: "Lifetime", count: stats.lifetimeUsers, color: "bg-yellow-500" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-4">
                      <div className="w-20 text-sm text-gray-500">{item.label}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                          className={`${item.color} h-4 rounded-full transition-all`}
                          style={{ width: stats.totalUsers ? `${(item.count / stats.totalUsers) * 100}%` : "0%" }}
                        />
                      </div>
                      <div className="w-12 text-right text-sm font-medium">{item.count}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="text-sm flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-gray-600">{log.action.replace(/_/g, " ")}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(log.createdAt).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">All Users</h2>
              <p className="text-gray-500">{users.length} total users</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">User</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Plan</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Calculations</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Joined</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.plan === "lifetime"
                                ? "bg-yellow-100 text-yellow-700"
                                : user.plan === "monthly"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {user.plan.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{user.calculationsUsed}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={user.plan}
                            onChange={(e) => updateUserPlan(user.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="free">Free</option>
                            <option value="monthly">Monthly</option>
                            <option value="lifetime">Lifetime</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "payments" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Payments</h2>
              <p className="text-gray-500">{payments.length} total payments</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">User</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Plan</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Method</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Reference</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-800">{payment.userName}</p>
                            <p className="text-sm text-gray-500">{payment.userEmail}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              payment.plan === "lifetime" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {payment.plan.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800">₱{(payment.amount / 100).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{payment.paymentMethod || "-"}</td>
                        <td className="px-4 py-3">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">{payment.referenceNumber || "-"}</code>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status.toUpperCase()}
                          </span>
                          {payment.rejectedReason && (
                            <p className="text-xs text-red-500 mt-1">{payment.rejectedReason}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {payment.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handlePayment(payment.id, "confirm")}
                                disabled={actionLoading === payment.id}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                              >
                                {actionLoading === payment.id ? "..." : "✓ Confirm"}
                              </button>
                              <button
                                onClick={() => handlePayment(payment.id, "reject")}
                                disabled={actionLoading === payment.id}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                              >
                                ✗ Reject
                              </button>
                            </div>
                          )}
                          {payment.status === "paid" && (
                            <span className="text-green-600 text-sm">✓ Confirmed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                          No payments yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "audit" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Audit Log</h2>
            <p className="text-gray-500">Track all important actions for security and accountability</p>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Time</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Action</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Details</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(log.createdAt).toLocaleString("en-PH")}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              log.action.includes("success") || log.action.includes("confirmed")
                                ? "bg-green-100 text-green-700"
                                : log.action.includes("failed") || log.action.includes("rejected")
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {log.action.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{log.details || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-400 font-mono">{log.ipAddress || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}

function SettingsTab() {
  const [settings, setSettings] = useState({
    gcashNumber: "",
    gcashName: "",
    paymayaNumber: "",
    paymayaName: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
    monthlyPrice: "50",
    lifetimePrice: "200",
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const token = localStorage.getItem("admin_token");
    const res = await fetch("/api/admin/settings", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setSettings((prev) => ({ ...prev, ...data.settings }));
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    const token = localStorage.getItem("admin_token");
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(settings),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Settings</h2>

      {/* Payment Settings */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">💳 Payment Details</h3>
        <p className="text-gray-500 text-sm mb-6">Users will see these details when making payments. Make sure they are correct!</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GCash */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h4 className="font-medium text-blue-800 flex items-center gap-2">
              <span className="text-2xl">📱</span> GCash
            </h4>
            <div>
              <label className="block text-sm text-gray-600 mb-1">GCash Number</label>
              <input
                type="text"
                value={settings.gcashNumber}
                onChange={(e) => setSettings({ ...settings, gcashNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="09XX XXX XXXX"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Account Name (as shown in GCash)</label>
              <input
                type="text"
                value={settings.gcashName}
                onChange={(e) => setSettings({ ...settings, gcashName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Juan Dela Cruz"
              />
            </div>
          </div>

          {/* PayMaya */}
          <div className="space-y-4 p-4 bg-green-50 rounded-xl border border-green-100">
            <h4 className="font-medium text-green-800 flex items-center gap-2">
              <span className="text-2xl">💚</span> PayMaya / Maya
            </h4>
            <div>
              <label className="block text-sm text-gray-600 mb-1">PayMaya Number</label>
              <input
                type="text"
                value={settings.paymayaNumber}
                onChange={(e) => setSettings({ ...settings, paymayaNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="09XX XXX XXXX"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Account Name</label>
              <input
                type="text"
                value={settings.paymayaName}
                onChange={(e) => setSettings({ ...settings, paymayaName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Juan Dela Cruz"
              />
            </div>
          </div>

          {/* Bank Transfer */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200 md:col-span-2">
            <h4 className="font-medium text-gray-800 flex items-center gap-2">
              <span className="text-2xl">🏦</span> Bank Transfer
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={settings.bankName}
                  onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="BDO, BPI, etc."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Account Number</label>
                <input
                  type="text"
                  value={settings.bankAccountNumber}
                  onChange={(e) => setSettings({ ...settings, bankAccountNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="XXXX XXXX XXXX"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Account Name</label>
                <input
                  type="text"
                  value={settings.bankAccountName}
                  onChange={(e) => setSettings({ ...settings, bankAccountName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Juan Dela Cruz"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Settings */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">💰 Pricing</h3>
        <p className="text-gray-500 text-sm mb-6">Set your subscription prices</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Monthly Price (₱)</label>
            <input
              type="number"
              value={settings.monthlyPrice}
              onChange={(e) => setSettings({ ...settings, monthlyPrice: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Lifetime Price (₱)</label>
            <input
              type="number"
              value={settings.lifetimePrice}
              onChange={(e) => setSettings({ ...settings, lifetimePrice: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              min="1"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={saveSettings}
        className={`px-8 py-3 rounded-lg font-semibold transition ${
          saved ? "bg-green-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {saved ? "✓ Saved Successfully!" : "Save All Settings"}
      </button>

      {/* Security Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h4 className="font-medium text-yellow-800 mb-2">🔒 Security Notes</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• To change your admin password, update the <code className="bg-yellow-100 px-1 rounded">ADMIN_PASSWORD</code> environment variable in Vercel</li>
          <li>• All admin actions are logged in the Audit Log</li>
          <li>• Payment reference numbers are validated to prevent duplicates</li>
          <li>• Users are rate-limited to prevent abuse</li>
        </ul>
      </div>
    </div>
  );
}
