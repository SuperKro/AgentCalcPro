"use client";

import { useState, useEffect, useCallback } from "react";

// ============ TYPES ============
interface User {
  id: number;
  email: string;
  name: string;
  plan: string;
  calculationsUsed: number;
  planExpiresAt: string | null;
}

interface HistoryItem {
  id: number;
  calculatorType: string;
  inputData: string;
  resultData: string;
  createdAt: string;
}

// ============ CALCULATOR DEFINITIONS ============
const CALCULATORS = [
  { id: "loan", name: "Loan Calculator", icon: "🏦", category: "Financing", free: true },
  { id: "mortgage", name: "Mortgage Calculator", icon: "🏠", category: "Financing", free: true },
  { id: "commission", name: "Commission Calculator", icon: "💰", category: "Earnings", free: true },
  { id: "amortization", name: "Amortization Schedule", icon: "📋", category: "Financing", free: false },
  { id: "roi", name: "ROI Calculator", icon: "📈", category: "Investment", free: false },
  { id: "rental-yield", name: "Rental Yield Calculator", icon: "🏘️", category: "Investment", free: false },
  { id: "affordability", name: "Affordability Calculator", icon: "🔑", category: "Buyers", free: false },
  { id: "stamp-duty", name: "Transfer Tax Calculator", icon: "📜", category: "Taxes", free: false },
  { id: "cap-rate", name: "Cap Rate Calculator", icon: "🧮", category: "Investment", free: false },
  { id: "closing-cost", name: "Closing Cost Estimator", icon: "📝", category: "Transactions", free: false },
  { id: "equity", name: "Home Equity Calculator", icon: "🏡", category: "Financing", free: false },
  { id: "compare", name: "Loan Comparison Tool", icon: "⚖️", category: "Financing", free: false },
];

const FREE_LIMIT = 5;

// ============ MAIN APP ============
export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"home" | "calculator" | "pricing" | "history" | "auth">("home");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [selectedCalc, setSelectedCalc] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(FREE_LIMIT);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setUser(d.user);
          if (d.user.plan === "lifetime" || (d.user.plan === "monthly" && d.user.planExpiresAt && new Date(d.user.planExpiresAt) > new Date())) {
            setRemaining(-1);
          } else {
            setRemaining(FREE_LIMIT - d.user.calculationsUsed);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const openCalculator = (calcId: string) => {
    if (!user) {
      setView("auth");
      showToast("Please sign in to use calculators");
      return;
    }
    setSelectedCalc(calcId);
    setView("calculator");
  };

  const saveCalculation = async (type: string, inputData: Record<string, unknown>, resultData: Record<string, unknown>) => {
    const res = await fetch("/api/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calculatorType: type, inputData, resultData }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.needsUpgrade) {
        setView("pricing");
        showToast(data.error);
        return false;
      }
      showToast(data.error || "Error saving calculation");
      return false;
    }
    if (data.remaining >= 0) {
      setRemaining(data.remaining);
    }
    return true;
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setView("home");
    setRemaining(FREE_LIMIT);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
        <div className="text-white text-2xl animate-pulse">Loading AgentCalc Pro...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => { setView("home"); setSelectedCalc(null); }} className="flex items-center gap-2 hover:opacity-80 transition">
            <span className="text-3xl">🧮</span>
            <div>
              <h1 className="text-xl font-bold leading-tight">AgentCalc Pro</h1>
              <p className="text-xs text-blue-200">Real Estate Calculator Suite</p>
            </div>
          </button>
          <nav className="flex items-center gap-3">
            {user && (
              <>
                <button onClick={() => setView("home")} className="text-sm hover:text-blue-200 transition px-2 py-1">Calculators</button>
                <button onClick={() => setView("history")} className="text-sm hover:text-blue-200 transition px-2 py-1">History</button>
                <button onClick={() => setView("pricing")} className="text-sm hover:text-blue-200 transition px-2 py-1">Pricing</button>
                <div className="flex items-center gap-2 ml-2 bg-blue-800/50 rounded-lg px-3 py-1.5">
                  <span className="text-sm">{user.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${user.plan === 'lifetime' ? 'bg-yellow-500 text-black' : user.plan === 'monthly' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {user.plan === 'lifetime' ? '⭐ LIFETIME' : user.plan === 'monthly' ? 'PRO' : 'FREE'}
                  </span>
                  {remaining >= 0 && <span className="text-xs text-blue-200">({remaining} left)</span>}
                </div>
                <button onClick={logout} className="text-sm bg-red-500/80 hover:bg-red-600 px-3 py-1.5 rounded-lg transition">Logout</button>
              </>
            )}
            {!user && (
              <>
                <button onClick={() => { setView("auth"); setAuthMode("login"); }} className="text-sm hover:text-blue-200 transition px-3 py-1.5">Sign In</button>
                <button onClick={() => { setView("auth"); setAuthMode("register"); }} className="text-sm bg-yellow-500 text-black hover:bg-yellow-400 px-4 py-1.5 rounded-lg font-medium transition">Sign Up Free</button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === "home" && <HomeView onSelectCalc={openCalculator} user={user} />}
        {view === "auth" && <AuthView mode={authMode} setMode={setAuthMode} onSuccess={(u) => {
          setUser(u);
          setRemaining(FREE_LIMIT - u.calculationsUsed);
          setView("home");
          showToast(`Welcome${u.name ? ', ' + u.name : ''}!`);
        }} />}
        {view === "calculator" && selectedCalc && <CalculatorView calcId={selectedCalc} onSave={saveCalculation} remaining={remaining} user={user} onUpgrade={() => setView("pricing")} />}
        {view === "pricing" && <PricingView user={user} onUpgrade={(u) => { setUser(u); setRemaining(-1); showToast("Plan upgraded successfully!"); }} />}
        {view === "history" && <HistoryView />}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center py-6 mt-12">
        <p className="text-sm">© 2025 AgentCalc Pro — Built for Real Estate Professionals</p>
        <p className="text-xs mt-1">Free tier: {FREE_LIMIT} calculations • Monthly: ₱50/mo • Lifetime: ₱200 one-time</p>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs">
          <a href="/help" className="hover:text-white transition">Help & FAQ</a>
          <span>•</span>
          <a href="/privacy" className="hover:text-white transition">Privacy Policy</a>
          <span>•</span>
          <a href="/terms" className="hover:text-white transition">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}

// ============ HOME VIEW ============
function HomeView({ onSelectCalc, user }: { onSelectCalc: (id: string) => void; user: User | null }) {
  const categories = [...new Set(CALCULATORS.map((c) => c.category))];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      {!user && (
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-2xl p-8 md:p-12 mb-10 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            All-in-One Calculator Suite<br />for Real Estate Agents
          </h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-6">
            Loan calculations, commission estimates, ROI analysis, amortization schedules, and more — everything you need to close deals faster.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="bg-white/20 px-4 py-2 rounded-lg text-sm">✅ {FREE_LIMIT} Free Calculations</span>
            <span className="bg-white/20 px-4 py-2 rounded-lg text-sm">✅ 12 Professional Calculators</span>
            <span className="bg-white/20 px-4 py-2 rounded-lg text-sm">✅ Save & Export History</span>
          </div>
        </div>
      )}

      {user && (
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user.name}! 👋</h2>
              <p className="text-gray-500 mt-1">
                {user.plan === 'free'
                  ? `You have ${Math.max(0, FREE_LIMIT - user.calculationsUsed)} free calculations remaining`
                  : user.plan === 'monthly'
                  ? 'Monthly Pro plan — unlimited calculations'
                  : '⭐ Lifetime member — unlimited calculations forever'}
              </p>
            </div>
            {user.plan === 'free' && (
              <div className="flex gap-2">
                <div className="flex">
                  {Array.from({ length: FREE_LIMIT }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full mx-0.5 ${i < user.calculationsUsed ? 'bg-gray-300' : 'bg-blue-500'}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calculator Grid by Category */}
      {categories.map((cat) => (
        <div key={cat} className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded-full inline-block" />
            {cat}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {CALCULATORS.filter((c) => c.category === cat).map((calc) => (
              <button
                key={calc.id}
                onClick={() => onSelectCalc(calc.id)}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{calc.icon}</span>
                  {calc.free ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">FREE</span>
                  ) : (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">PRO</span>
                  )}
                </div>
                <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition">{calc.name}</h4>
                <p className="text-sm text-gray-500 mt-1">{getCalcDescription(calc.id)}</p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function getCalcDescription(id: string): string {
  const descriptions: Record<string, string> = {
    loan: "Calculate monthly payments, total interest, and total cost for any loan",
    mortgage: "Full mortgage calculator with taxes, insurance, and PMI",
    commission: "Calculate your commission earnings from property sales",
    amortization: "View detailed month-by-month payment breakdown",
    roi: "Analyze return on investment for rental properties",
    "rental-yield": "Calculate gross and net rental yield percentages",
    affordability: "Help buyers determine their price range",
    "stamp-duty": "Estimate transfer taxes and documentary stamp taxes",
    "cap-rate": "Calculate capitalization rate for investment properties",
    "closing-cost": "Estimate all closing costs for buyers and sellers",
    equity: "Calculate current home equity and LTV ratio",
    compare: "Compare up to 3 loan offers side by side",
  };
  return descriptions[id] || "";
}

// ============ AUTH VIEW ============
function AuthView({
  mode,
  setMode,
  onSuccess,
}: {
  mode: "login" | "register";
  setMode: (m: "login" | "register") => void;
  onSuccess: (user: User) => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login" ? { email, password } : { email, name, password };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      onSuccess(data.user);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto animate-slide-up">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-6">
          <span className="text-5xl">🧮</span>
          <h2 className="text-2xl font-bold mt-3">{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
          <p className="text-gray-500 mt-1">
            {mode === "login" ? "Sign in to continue using calculators" : "Get 5 free calculations instantly"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Juan Dela Cruz"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="agent@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {submitting ? "Please wait..." : mode === "login" ? "Sign In" : "Create Free Account"}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-500">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button onClick={() => setMode("register")} className="text-blue-600 hover:underline font-medium">
                Sign Up Free
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => setMode("login")} className="text-blue-600 hover:underline font-medium">
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ CALCULATOR VIEW ============
function CalculatorView({
  calcId,
  onSave,
  remaining,
  user,
  onUpgrade,
}: {
  calcId: string;
  onSave: (type: string, inputs: Record<string, unknown>, results: Record<string, unknown>) => Promise<boolean>;
  remaining: number;
  user: User | null;
  onUpgrade: () => void;
}) {
  const calc = CALCULATORS.find((c) => c.id === calcId);
  if (!calc) return <div>Calculator not found</div>;

  // Check if user needs upgrade for PRO calculators
  const isPro = !calc.free;
  const isFreePlan = user?.plan === 'free' || (user?.plan === 'monthly' && user?.planExpiresAt && new Date(user.planExpiresAt) < new Date());
  const needsUpgradeForPro = isPro && isFreePlan && remaining <= 0;

  if (needsUpgradeForPro) {
    return (
      <div className="max-w-lg mx-auto text-center animate-slide-up">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <span className="text-6xl">🔒</span>
          <h2 className="text-2xl font-bold mt-4 mb-2">Upgrade Required</h2>
          <p className="text-gray-500 mb-6">You&apos;ve used all {FREE_LIMIT} free calculations. Upgrade to unlock unlimited access to all calculators.</p>
          <button onClick={onUpgrade} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition">
            View Plans & Upgrade
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">{calc.icon}</span>
          <h2 className="text-2xl font-bold text-gray-800">{calc.name}</h2>
          {isPro && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">PRO</span>}
        </div>
        {remaining >= 0 && (
          <p className="text-sm text-gray-500">
            {remaining} free calculation{remaining !== 1 ? 's' : ''} remaining
          </p>
        )}
      </div>

      {calcId === "loan" && <LoanCalculator onSave={onSave} />}
      {calcId === "mortgage" && <MortgageCalculator onSave={onSave} />}
      {calcId === "commission" && <CommissionCalculator onSave={onSave} />}
      {calcId === "amortization" && <AmortizationCalculator onSave={onSave} />}
      {calcId === "roi" && <ROICalculator onSave={onSave} />}
      {calcId === "rental-yield" && <RentalYieldCalculator onSave={onSave} />}
      {calcId === "affordability" && <AffordabilityCalculator onSave={onSave} />}
      {calcId === "stamp-duty" && <TransferTaxCalculator onSave={onSave} />}
      {calcId === "cap-rate" && <CapRateCalculator onSave={onSave} />}
      {calcId === "closing-cost" && <ClosingCostCalculator onSave={onSave} />}
      {calcId === "equity" && <EquityCalculator onSave={onSave} />}
      {calcId === "compare" && <LoanCompareCalculator onSave={onSave} />}
    </div>
  );
}

// ============ INPUT COMPONENT ============
function CalcInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  type = "number",
  placeholder,
  min,
  step,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
  placeholder?: string;
  min?: number;
  step?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex">
        {prefix && <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-600">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-2.5 border border-gray-300 ${prefix ? '' : 'rounded-l-lg'} ${suffix ? '' : 'rounded-r-lg'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
          placeholder={placeholder}
          min={min}
          step={step}
        />
        {suffix && <span className="inline-flex items-center px-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-600">{suffix}</span>}
      </div>
    </div>
  );
}

function ResultCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`p-4 rounded-lg ${highlight ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-bold mt-1 ${highlight ? 'text-blue-700' : 'text-gray-800'}`}>{value}</p>
    </div>
  );
}

function formatPeso(n: number): string {
  return "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ============ LOAN CALCULATOR ============
function LoanCalculator({ onSave }: { onSave: (type: string, i: Record<string, unknown>, r: Record<string, unknown>) => Promise<boolean> }) {
  const [principal, setPrincipal] = useState("1000000");
  const [rate, setRate] = useState("6.5");
  const [years, setYears] = useState("20");
  const [result, setResult] = useState<{ monthly: number; totalInterest: number; totalPayment: number } | null>(null);

  const calculate = async () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(years) * 12;
    if (!p || !r || !n) return;
    const monthly = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = monthly * n;
    const totalInterest = totalPayment - p;
    const res = { monthly, totalInterest, totalPayment };
    setResult(res);
    await onSave("Loan Calculator", { principal: p, rate: parseFloat(rate), years: parseFloat(years) }, res);
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <CalcInput label="Loan Amount" value={principal} onChange={setPrincipal} prefix="₱" />
          <CalcInput label="Annual Interest Rate" value={rate} onChange={setRate} suffix="%" step="0.1" />
          <CalcInput label="Loan Term" value={years} onChange={setYears} suffix="years" />
        </div>
        <button onClick={calculate} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition">
          Calculate Loan
        </button>
      </div>
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 animate-fade-in">
          <ResultCard label="Monthly Payment" value={formatPeso(result.monthly)} highlight />
          <ResultCard label="Total Interest" value={formatPeso(result.totalInterest)} />
          <ResultCard label="Total Payment" value={formatPeso(result.totalPayment)} />
        </div>
      )}
    </div>
  );
}

// ============ MORTGAGE CALCULATOR ============
function MortgageCalculator({ onSave }: { onSave: (type: string, i: Record<string, unknown>, r: Record<string, unknown>) => Promise<boolean> }) {
  const [price, setPrice] = useState("3000000");
  const [downPayment, setDownPayment] = useState("20");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("25");
  const [tax, setTax] = useState("15000");
  const [insurance, setInsurance] = useState("8000");
  const [result, setResult] = useState<{ principal: number; monthlyPI: number; monthlyTax: number; monthlyIns: number; totalMonthly: number; totalCost: number } | null>(null);

  const calculate = async () => {
    const p = parseFloat(price);
    const dp = parseFloat(downPayment) / 100;
    const loanAmt = p * (1 - dp);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(years) * 12;
    const monthlyPI = (loanAmt * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const monthlyTax = parseFloat(tax) / 12;
    const monthlyIns = parseFloat(insurance) / 12;
    const totalMonthly = monthlyPI + monthlyTax + monthlyIns;
    const totalCost = totalMonthly * n;
    const res = { principal: loanAmt, monthlyPI, monthlyTax, monthlyIns, totalMonthly, totalCost };
    setResult(res);
    await onSave("Mortgage Calculator", { price: p, downPayment: dp * 100, rate: parseFloat(rate), years: parseFloat(years), tax: parseFloat(tax), insurance: parseFloat(insurance) }, res);
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <CalcInput label="Property Price" value={price} onChange={setPrice} prefix="₱" />
          <CalcInput label="Down Payment" value={downPayment} onChange={setDownPayment} suffix="%" />
          <CalcInput label="Annual Interest Rate" value={rate} onChange={setRate} suffix="%" step="0.1" />
          <CalcInput label="Loan Term" value={years} onChange={setYears} suffix="years" />
          <CalcInput label="Annual Property Tax" value={tax} onChange={setTax} prefix="₱" />
          <CalcInput label="Annual Insurance" value={insurance} onChange={setInsurance} prefix="₱" />
        </div>
        <button onClick={calculate} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition">
          Calculate Mortgage
        </button>
      </div>
      {result && (
        <div className="mt-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <ResultCard label="Total Monthly Payment" value={formatPeso(result.totalMonthly)} highlight />
            <ResultCard label="Loan Amount" value={formatPeso(result.principal)} />
            <ResultCard label="Monthly Principal & Interest" value={formatPeso(result.monthlyPI)} />
            <ResultCard label="Monthly Tax & Insurance" value={formatPeso(result.monthlyTax + result.monthlyIns)} />
          </div>
          <ResultCard label="Total Cost Over Loan Term" value={formatPeso(result.totalCost)} />
        </div>
      )}
    </div>
  );
}

// ============ COMMISSION CALCULATOR ============
function CommissionCalculator({ onSave }: { onSave: (type: string, i: Record<string, unknown>, r: Record<string, unknown>) => Promise<boolean> }) {
  const [salePrice, setSalePrice] = useState("5000000");
  const [commRate, setCommRate] = useState("3");
  const [split, setSplit] = useState("60");
  const [vat, setVat] = useState("12");
  const [result, setResult] = useState<{ grossComm: number; agentShare: number; vatAmount: number; netComm: number } | null>(null);

  const calculate = async () => {
    const sp = parseFloat(salePrice);
    const cr = parseFloat(commRate) / 100;
    const agentSplit = parseFloat(split) / 100;
    const vatRate = parseFloat(vat) / 100;
    const grossComm = sp * cr;
    const agentShare = grossComm * agentSplit;
    const vatAmount = agentShare * vatRate;
    const netComm = agentShare - vatAmount;
    const res = { grossComm, agentShare, vatAmount, netComm };
    setResult(res);
    await onSave("Commission Calculator", { salePrice: sp, commRate: parseFloat(commRate), split: parseFloat(split), vat: parseFloat(vat) }, res);
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <CalcInput label="Sale Price" value={salePrice} onChange={setSalePrice} prefix="₱" />
          <CalcInput label="Commission Rate" value={commRate} onChange={setCommRate} suffix="%" step="0.1" />
          <CalcInput label="Agent Split" value={split} onChange={setSplit} suffix="%" />
          <CalcInput label="VAT/Withholding Tax" value={vat} onChange={setVat} suffix="%" />
        </div>
        <button onClick={calculate} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition">
          Calculate Commission
        </button>
      </div>
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 animate-fade-in">
          <ResultCard label="Gross Commission" value={formatPeso(result.grossComm)} />
          <ResultCard label="Your Share (Agent Split)" value={formatPeso(result.agentShare)} />
          <ResultCard label="Tax Deduction" value={formatPeso(result.vatAmount)} />
          <ResultCard label="Net Commission (Take Home)" value={formatPeso(result.netComm)} highlight />
        </div>
      )}
    </div>
  );
}

// ============ AMORTIZATION CALCULATOR ============
function AmortizationCalculator({ onSave }: { onSave: (type: string, i: Record<string, unknown>, r: Record<string, unknown>) => Promise<boolean> }) {
  const [principal, setPrincipal] = useState("2000000");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("15");
  const [schedule, setSchedule] = useState<Array<{ month: number; payment: number; principalPart: number; interest: number; balance: number }>>([]);

  const calculate = async () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(years) * 12;
    const monthly = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    let balance = p;
    const rows: typeof schedule = [];
    for (let i = 1; i <= n; i++) {
      const interest = balance * r;
      const principalPart = monthly - interest;
      balance -= principalPart;
      rows.push({ month: i, payment: monthly, principalPart, interest, balance: Math.max(0, balance) });
    }
    setSchedule(rows);
    await onSave("Amortization Schedule", { principal: p, rate: parseFloat(rate), years: parseFloat(years) }, { monthlyPayment: monthly, totalPayments: rows.length });
  };

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <CalcInput label="Loan Amount" value={principal} onChange={setPrincipal} prefix="₱" />
          <CalcInput label="Annual Interest Rate" value={rate} onChange={setRate} suffix="%" step="0.1" />
          <CalcInput label="Loan Term" value={years} onChange={setYears} suffix="years" />
        </div>
        <button onClick={calculate} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition">
          Generate Amortization Schedule
        </button>
      </div>
      {schedule.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
          <div className="p-4 border-b bg-gray-50">
            <p className="font-semibold">Monthly Payment: {formatPeso(schedule[0].payment)}</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Month</th>
                  <th className="px-4 py-2 text-right">Payment</th>
                  <th className="px-4 py-2 text-right">Principal</th>
                  <th className="px-4 py-2 text-right">Interest</th>
                  <th className="px-4 py-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row) => (
                  <tr key={row.month} className="border-t hover:bg-blue-50/30">
                    <td className="px-4 py-2">{row.month}</td>
                    <td className="px-4 py-2 text-right">{formatPeso(row.payment)}</td>
                    <td className="px-4 py-2 text-right">{formatPeso(row.principalPart)}</td>
                    <td className="px-4 py-2 text-right">{formatPeso(row.interest)}</td>
                    <td className="px-4 py-2 text-right">{formatPeso(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ ROI CALCULATOR ============
function ROICalculator({ onSave }: { onSave: (type: string, i: Record<string, unknown>, r: Record<string, unknown>) => Promise<boolean> }) {
  const [purchasePrice, setPurchasePrice] = useState("3000000");
  const [monthlyRent, setMonthlyRent] = useState("15000");
  const [annualExpenses, setAnnualExpenses] = useState("50000");
  const [appreciation, setAppreciation] = useState("5");
  const [holdYears, setHoldYears] = useState("5");
  const [result, setResult] = useState<{ annualRentalIncome: number; netIncome: number; cashROI: number; futureValue: number; totalROI: number; totalReturn: number } | null>(null);

  const calculate = async () => {
    const pp = parseFloat(purchasePrice);
    const mr = parseFloat(monthlyRent);
    const ae = parseFloat(annualExpenses);
    const ap = parseFloat(appreciation) / 100;
    const hy = parseFloat(holdYears);
    const annualRentalIncome = mr * 12;
    const netIncome = annualRentalIncome - ae;
    const cashROI = (netIncome / pp) * 100;
    const futureValue = pp * Math.pow(1 + ap, hy);
    const totalReturn = (netIncome * hy) + (futureValue - pp);
    const totalROI = (totalReturn / pp) * 100;
    const res = { annualRentalIncome, netIncome, cashROI, futureValue, totalROI, totalReturn };
    setResult(res);
    await onSave("ROI Calculator", { purchasePrice: pp, monthlyRent: mr, annualExpenses: ae, appreciation: parseFloat(appreciation), holdYears: hy }, res);
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <CalcInput label="Purchase Price" value={purchasePrice} onChange={setPurchasePrice} prefix="₱" />
          <CalcInput label="Monthly Rent" value={monthlyRent} onChange={setMonthlyRent} prefix="₱" />
          <CalcInput label="Annual Expenses" value={annualExpenses} onChange={setAnnualExpenses} prefix="₱" />
          <CalcInput label="Annual Appreciation" value={appreciation} onChange={setAppreciation} suffix="%" />
          <CalcInput label="Hold Period" value={holdYears} onChange={setHoldYears} suffix="years" />
        </div>
        <button onClick={calculate} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition">
          Calculate ROI
        </button>
      </div>
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 animate-fade-in">
          <ResultCard label="Annual Rental Income" value={formatPeso(result.annualRentalIncome)} />
          <ResultCard label="Net Annual Income" value={formatPeso(result.netIncome)} />
          <ResultCard label="Cash-on-Cash ROI" value={result.cashROI.toFixed(2) + "%"} highlight />
          <ResultCard label="Future Property Value" value={formatPeso(result.futureValue)} />
          <ResultCard label="Total Return" value={formatPeso(result.totalReturn)} />
          <ResultCard label="Total ROI" value={result.totalROI.toFixed(2) + "%"} highlight />
        </div>
      )}
    </div>
  );
}

// ============ RENTAL YIELD CALCULATOR ============
function RentalYieldCalculator({ onSave }: { onSave: (type: string, i: Record<string, unknown>, r: Record<string, unknown>) => Promise<boolean> }) {
  const [propertyValue, setPropertyValue] = useState("2500000");
  const [monthlyRent, setMonthlyRent] = useState("12000");
  const [annualCosts, setAnnualCosts] = useState("30000");
  const [vacancyRate, setVacancyRate] = useState("5");
  const [result, setResult] = useState<{ grossYield: number; netYield: number; effectiveRent: number; annualNet: number } | null>(null);

  const calculate = async () => {
    const pv = parseFloat(propertyValue);
    const mr = parseFloat(monthlyRent);
    const ac = parseFloat(annualCosts);
    const vr = parseFloat(vacancyRate) / 100;
    const effectiveRent = mr * 12 * (1 - vr);
    const grossYield = (mr * 12 / pv) * 100;
    const annualNet = effectiveRent - ac;
    const netYield = (annualNet / pv) * 100;
    const res = { grossYield, netYield, effectiveRent, annualNet };
    setResult(res);
    await onSave("Rental Yield Calculator", { propertyValue: pv, monthlyRent: mr, annualCosts: ac, vacancyRate: parseFloat(vacancyRate) }, res);
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <CalcInput label="Property Value" value={propertyValue} onChange={setPropertyValue} prefix="₱" />
          <CalcInput label="Monthly Rent" value={monthlyRent} onChange={setMonthlyRent} prefix="₱" />
          <CalcInput label="Annual Costs (maintenance, etc.)" value={annualCosts} onChange={setAnnualCosts} prefix="₱" />
          <CalcInput label="Vacancy Rate" value={vacancyRate} onChange={setVacancyRate} suffix="%" />
        </div>
        <button onClick={calculate} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition">
          Calculate Rental Yield
        </button>
      </div>
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 animate-fade-in">
          <ResultCard label="Gross Rental Yield" value={result.grossYield.toFixed(2) + "%"} highlight />
          <ResultCard label="Net Rental Yield" value={result.netYield.toFixed(2) + "%"} highlight />
          <ResultCard label="Effective Annual Rent" value={formatPeso(result.effectiveRent)} />
          <ResultCard label="Annual Net Income" value={formatPeso(result.annualNet)} />
        </div>
      )}
    </div>
  );
}

// ============ AFFORDABILITY CALCULATOR ============
function AffordabilityCalculator({ onSave }: { onSave: (type: string, i: Record<string, unknown>, r: Record<string, unknown>) => Promise<boolean> }) {
  const [monthlyIncome, setMonthlyIncome] = useState("80000");
  const [monthlyDebts, setMonthlyDebts] = useState("10000");
  const [downPaymentSavings, setDownPaymentSavings] = useState("500000");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("20");
  const [result, setResult] = useState<{ maxMonthlyPayment: number; maxLoanAmount: number; maxPropertyPrice: number; dtiRatio: number } | null>(null);

  const calculate = async () => {
    const income = parseFloat(monthlyIncome);
    const debts = parseFloat(monthlyDebts);
    const dp = parseFloat(downPaymentSavings);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(years) * 12;
    // Using 36% DTI ratio as standard
    const maxMonthlyPayment = (income * 0.36) - debts;
    // Reverse mortgage formula
    const maxLoanAmount = maxMonthlyPayment * ((Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)));
    const maxPropertyPrice = maxLoanAmount + dp;
    const dtiRatio = ((maxMonthlyPayment + debts) / income) * 100;
    const res = { maxMonthlyPayment, maxLoanAmount, maxPropertyPrice, dtiRatio };
    setResult(res);
    await onSave("Affordability Calculator", { monthlyIncome: income, monthlyDebts: debts, downPaymentSavings: dp, rate: parseFloat(rate), years: parseFloat(years) }, res);
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <CalcInput label="Monthly Gross Income" value={monthlyIncome} onChange={setMonthlyIncome} prefix="₱" />
          <CalcInput label="Monthly Debt Payments" value={monthlyDebts} onChange={setMonthlyDebts} prefix="₱" />
          <CalcInput label="Down Payment Savings" value={downPaymentSavings} onChange={setDownPaymentSavings} prefix="₱" />
          <CalcInput label="Interest Rate" value={rate} onChange={setRate} suffix="%" step="0.1" />
          <CalcInput label="Loan Term" value={years} onChange={setYears} suffix="years" />
        </div>
        <button onClick={calculate} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition">
          Calculate Affordability
        </button>
      </div>
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 animate-fade-in">
          <ResultCard label="Maximum Property Price" value={formatPeso(result.maxPropertyPrice)} highlight />
          <ResultCard label="Maximum Loan Amount" value={formatPeso(result.maxLoanAmount)} />
          <ResultCard label="Maximum Monthly Payment" value={formatPeso(result.maxMonthlyPayment)} />
          <ResultCard label="Debt-to-Income Ratio" value={result.dtiRatio.toFixed(1) + "%"} />
        </div>
      )}
    </div>
  );
}

// ============ TRANSFER TAX CALCULATOR ============
function TransferTaxCalculator({ onSave }: { onSave: (type: string, i: Record<string, unknown>, r: Record<string, unknown>) => Promise<boolean> }) {
  const [sellingPrice, setSellingPrice] = useState("3000000");
  const [fairMarketValue, setFairMarketValue] = useState("2800000");
  const [result, setResult] = useState<{ taxBase: number; capitalGainsTax: number; docStampTax: number; transferTax: number; registrationFee: number; totalTaxes: number } | null>(null);

  const calculate = async () => {
    const sp = parseFloat(sellingPrice);
    const fmv = parseFloat(fairMarketValue);
    const taxBase = Math.max(sp, fmv);
    // Philippine tax rates
    const capitalGainsTax = taxBase * 0.06; // 6% CGT
    const docStampTax = taxBase * 0.015; // 1.5% DST
    const transferTax = taxBase * 0.005; // 0.5% local transfer tax (varies)
    const registrationFee = taxBase * 0.01; // ~1% registration
    const totalTaxes = capitalGainsTax + docStampTax + transferTax + registrationFee;
    const res = { taxBase, capitalGainsTax, docStampTax, transferTax, registrationFee, totalTaxes };
    setResult(res);
    await onSave("Transfer Tax Calculator", { sellingPrice: sp, fairMarketValue: fmv }, res);
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <CalcInput label="Selling Price" value={sellingPrice} onChange={setSellingPrice} prefix="₱" />
          <CalcInput label="Fair Market Value (Zonal/BIR)" value={fairMarketValue} onChange={setFairMarketValue} prefix="₱" />
        </div>
        <button onClick={calculate} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition">
          Calculate Taxes
        </button>
      </div>
      {result && (
        <div className="mt-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <ResultCard label="Tax Base (Higher of SP/FMV)" value={formatPeso(result.taxBase)} />
            <ResultCard label="Capital Gains Tax (6%)" value={formatPeso(result.capitalGainsTax)} />
            <ResultCard label="Documentary Stamp Tax (1.5%)" value={formatPeso(result.docStampTax)} />
            <ResultCard label="Local Transfer Tax (~0.5%)" value={formatPeso(result.transferTax)} />
            <ResultCard label="Registration Fee (~1%)" value={formatPeso(result.registrationFee)} />
            <ResultCard label="Total Estimated Taxes" value={formatPeso(result.totalTaxes)} highlight />
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            ⚠️ Rates are based on Philippine tax standards. Actual rates may vary by location. Consult a tax professional.
          </div>
        </div>
      )}
    </div>
  );
}

// ============ CAP RATE CALCULATOR ============
function CapRateCalculator({ onSave }: { onSave: (type: string, i: Record<string, unknown>, r: Record<string, unknown>) => Promise<boolean> }) {
  const [propertyValue, setPropertyValue] = useState("5000000");
  const [grossIncome, setGrossIncome] = useState("360000");
  const [operatingExpenses, setOperatingExpenses] = useState("80000");
  const [result, setResult] = useState<{ noi: number; capRate: number; grm: number } | null>(null);

  const calculate = async () => {
    const pv = parseFloat(propertyValue);
    const gi = parseFloat(grossIncome);
    const oe = parseFloat(operatingExpenses);
    const noi = gi - oe;
    const capRate = (noi / pv) * 100;
    const grm = pv / gi;
    const res = { noi, capRate, grm };
    setResult(res);
    await onSave("Cap Rate Calculator", { propertyValue: pv, grossIncome: gi, operatingExpenses: oe }, res);
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <CalcInput label="Property Value" value={propertyValue} onChange={setPropertyValue} prefix="₱" />
          <CalcInput label="Annual Gross Income" value={grossIncome} onChange={setGrossIncome} prefix="₱" />
          <CalcInput label="Annual Operating Expenses" value={operatingExpenses} onChange={setOperatingExpenses} prefix="₱" />
        </div>
        <button onClick={calculate} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition">
          Calculate Cap Rate
        </button>
      </div>
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 animate-fade-in">
          <ResultCard label="Net Operating Income (NOI)" value={formatPeso(result.noi)} />
          <ResultCard label="Cap Rate" value={result.capRate.toFixed(2) + "%"} highlight />
          <ResultCard label="Gross Rent Multiplier" value={result.grm.toFixed(2) + "x"} />
        </div>
      )}
    </div>
  );
}

// ============ CLOSING COST CALCULATOR ============
function ClosingCostCalculator({ onSave }: { onSave: (type: string, i: Record<string, unknown>, r: Record<string, unknown>) => Promise<boolean> }) {
  const [salePrice, setSalePrice] = useState("3500000");
  const [role, setRole] = useState("buyer");
  const [result, setResult] = useState<{ items: Array<{ name: string; amount: number }>; total: number } | null>(null);

  const calculate = async () => {
    const sp = parseFloat(salePrice);
    let items: Array<{ name: string; amount: number }>;
    if (role === "buyer") {
      items = [
        { name: "Documentary Stamp Tax (1.5%)", amount: sp * 0.015 },
        { name: "Transfer Tax (0.5%)", amount: sp * 0.005 },
        { name: "Registration Fee (~1%)", amount: sp * 0.01 },
        { name: "Notarial Fee (~1-2%)", amount: sp * 0.015 },
        { name: "Title Insurance (~0.5%)", amount: sp * 0.005 },
        { name: "Miscellaneous Fees", amount: 15000 },
      ];
    } else {
      items = [
        { name: "Capital Gains Tax (6%)", amount: sp * 0.06 },
        { name: "Agent Commission (3%)", amount: sp * 0.03 },
        { name: "Unpaid Real Property Tax", amount: sp * 0.005 },
        { name: "Notarial Fee (~1%)", amount: sp * 0.01 },
        { name: "Miscellaneous Fees", amount: 10000 },
      ];
    }
    const total = items.reduce((s, i) => s + i.amount, 0);
    const res = { items, total };
    setResult(res);
    await onSave("Closing Cost Estimator", { salePrice: sp, role }, res);
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <CalcInput label="Sale Price" value={salePrice} onChange={setSalePrice} prefix="₱" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </div>
        </div>
        <button onClick={calculate} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition">
          Estimate Closing Costs
        </button>
      </div>
      {result && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fade-in">
          <h3 className="font-semibold text-lg mb-4">Closing Cost Breakdown ({role === 'buyer' ? 'Buyer' : 'Seller'})</h3>
          <div className="space-y-3">
            {result.items.map((item, idx) => (
              <div key={idx} className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{item.name}</span>
                <span className="font-medium">{formatPeso(item.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between py-3 text-lg font-bold text-blue-700">
              <span>Total Estimated Closing Costs</span>
              <span>{formatPeso(result.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ HOME EQUITY CALCULATOR ============
function EquityCalculator({ onSave }: { onSave: (type: string, i: Record<string, unknown>, r: Record<string, unknown>) => Promise<boolean> }) {
  const [currentValue, setCurrentValue] = useState("4000000");
  const [originalLoan, setOriginalLoan] = useState("3000000");
  const [remainingBalance, setRemainingBalance] = useState("2200000");
  const [result, setResult] = useState<{ equity: number; equityPercent: number; ltv: number } | null>(null);

  const calculate = async () => {
    const cv = parseFloat(currentValue);
    const rb = parseFloat(remainingBalance);
    const equity = cv - rb;
    const equityPercent = (equity / cv) * 100;
    const ltv = (rb / cv) * 100;
    const res = { equity, equityPercent, ltv };
    setResult(res);
    await onSave("Home Equity Calculator", { currentValue: cv, originalLoan: parseFloat(originalLoan), remainingBalance: rb }, res);
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <CalcInput label="Current Property Value" value={currentValue} onChange={setCurrentValue} prefix="₱" />
          <CalcInput label="Original Loan Amount" value={originalLoan} onChange={setOriginalLoan} prefix="₱" />
          <CalcInput label="Remaining Balance" value={remainingBalance} onChange={setRemainingBalance} prefix="₱" />
        </div>
        <button onClick={calculate} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition">
          Calculate Equity
        </button>
      </div>
      {result && (
        <div className="mt-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <ResultCard label="Home Equity" value={formatPeso(result.equity)} highlight />
            <ResultCard label="Equity Percentage" value={result.equityPercent.toFixed(1) + "%"} />
            <ResultCard label="Loan-to-Value (LTV)" value={result.ltv.toFixed(1) + "%"} />
          </div>
          {/* Equity Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500 mb-2">Equity vs. Debt</p>
            <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden flex">
              <div className="bg-green-500 h-full transition-all" style={{ width: result.equityPercent + '%' }} />
              <div className="bg-red-400 h-full transition-all" style={{ width: result.ltv + '%' }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>🟢 Equity: {result.equityPercent.toFixed(1)}%</span>
              <span>🔴 Debt: {result.ltv.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ LOAN COMPARISON CALCULATOR ============
function LoanCompareCalculator({ onSave }: { onSave: (type: string, i: Record<string, unknown>, r: Record<string, unknown>) => Promise<boolean> }) {
  const [loans, setLoans] = useState([
    { name: "Bank A", amount: "2000000", rate: "6.5", years: "20" },
    { name: "Bank B", amount: "2000000", rate: "7.0", years: "15" },
    { name: "Bank C", amount: "2000000", rate: "5.5", years: "25" },
  ]);
  const [results, setResults] = useState<Array<{ name: string; monthly: number; totalInterest: number; totalPayment: number }>>([]);

  const updateLoan = (idx: number, field: string, value: string) => {
    const newLoans = [...loans];
    newLoans[idx] = { ...newLoans[idx], [field]: value };
    setLoans(newLoans);
  };

  const calculate = async () => {
    const res = loans.map((loan) => {
      const p = parseFloat(loan.amount);
      const r = parseFloat(loan.rate) / 100 / 12;
      const n = parseFloat(loan.years) * 12;
      if (!p || !r || !n) return { name: loan.name, monthly: 0, totalInterest: 0, totalPayment: 0 };
      const monthly = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPayment = monthly * n;
      const totalInterest = totalPayment - p;
      return { name: loan.name, monthly, totalInterest, totalPayment };
    });
    setResults(res);
    await onSave("Loan Comparison", { loans }, { comparisons: res });
  };

  const best = results.length > 0 ? results.reduce((a, b) => a.totalPayment < b.totalPayment ? a : b) : null;

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-4">
          {loans.map((loan, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
              <CalcInput label={`Loan ${idx + 1} Name`} value={loan.name} onChange={(v) => updateLoan(idx, "name", v)} type="text" />
              <CalcInput label="Loan Amount" value={loan.amount} onChange={(v) => updateLoan(idx, "amount", v)} prefix="₱" />
              <CalcInput label="Rate" value={loan.rate} onChange={(v) => updateLoan(idx, "rate", v)} suffix="%" step="0.1" />
              <CalcInput label="Term" value={loan.years} onChange={(v) => updateLoan(idx, "years", v)} suffix="yrs" />
            </div>
          ))}
        </div>
        <button onClick={calculate} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition">
          Compare Loans
        </button>
      </div>
      {results.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          {results.map((r, idx) => (
            <div key={idx} className={`bg-white rounded-xl shadow-sm border-2 p-6 ${best && r.name === best.name ? 'border-green-400 ring-2 ring-green-100' : 'border-gray-100'}`}>
              {best && r.name === best.name && (
                <div className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full inline-block mb-3">⭐ Best Deal</div>
              )}
              <h4 className="font-bold text-lg text-gray-800 mb-4">{r.name}</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Monthly Payment</p>
                  <p className="text-xl font-bold text-blue-700">{formatPeso(r.monthly)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Interest</p>
                  <p className="font-semibold text-gray-700">{formatPeso(r.totalInterest)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Payment</p>
                  <p className="font-semibold text-gray-700">{formatPeso(r.totalPayment)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ PRICING VIEW ============
function PricingView({ user, onUpgrade }: { user: User | null; onUpgrade: (user: User) => void }) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch("/api/payment/settings")
      .then((r) => r.json())
      .then((d) => setPaymentSettings(d));
  }, []);

  const monthlyPrice = paymentSettings.monthlyPrice || "50";
  const lifetimePrice = paymentSettings.lifetimePrice || "200";

  const submitPayment = async () => {
    if (!paymentMethod || !referenceNumber) {
      alert("Please select payment method and enter reference number");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan, paymentMethod, referenceNumber }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        alert("Failed to submit payment");
      }
    } catch {
      alert("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center animate-slide-up">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <span className="text-6xl">✅</span>
          <h2 className="text-2xl font-bold mt-4 mb-2">Payment Submitted!</h2>
          <p className="text-gray-500 mb-6">
            Thank you! Your payment is being verified. Once confirmed by the admin, your account will be upgraded automatically.
          </p>
          <p className="text-sm text-gray-400">
            Reference: {referenceNumber}
          </p>
          <button onClick={() => { setSubmitted(false); setSelectedPlan(null); }} className="mt-6 text-blue-600 hover:underline">
            ← Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  if (selectedPlan) {
    const price = selectedPlan === "monthly" ? monthlyPrice : lifetimePrice;
    return (
      <div className="max-w-2xl mx-auto animate-slide-up">
        <button onClick={() => setSelectedPlan(null)} className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Plans
        </button>
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Complete Your Payment
          </h2>
          <p className="text-gray-500 mb-6">
            {selectedPlan === "monthly" ? "Monthly Pro" : "Lifetime Access"} - <span className="font-bold text-green-600">₱{price}</span>
          </p>

          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-700">Step 1: Choose Payment Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {paymentSettings.gcashNumber && (
                <button
                  onClick={() => setPaymentMethod("gcash")}
                  className={`p-4 rounded-xl border-2 text-left transition ${paymentMethod === "gcash" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <span className="text-2xl">📱</span>
                  <p className="font-medium mt-2">GCash</p>
                </button>
              )}
              {paymentSettings.paymayaNumber && (
                <button
                  onClick={() => setPaymentMethod("paymaya")}
                  className={`p-4 rounded-xl border-2 text-left transition ${paymentMethod === "paymaya" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <span className="text-2xl">💚</span>
                  <p className="font-medium mt-2">PayMaya</p>
                </button>
              )}
              {paymentSettings.bankName && (
                <button
                  onClick={() => setPaymentMethod("bank")}
                  className={`p-4 rounded-xl border-2 text-left transition ${paymentMethod === "bank" ? "border-gray-500 bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <span className="text-2xl">🏦</span>
                  <p className="font-medium mt-2">Bank Transfer</p>
                </button>
              )}
            </div>
            {!paymentSettings.gcashNumber && !paymentSettings.paymayaNumber && !paymentSettings.bankName && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
                ⚠️ Payment methods not yet configured. Please contact the admin.
              </div>
            )}
          </div>

          {paymentMethod && (
            <div className="space-y-4 mb-6 animate-fade-in">
              <h3 className="font-semibold text-gray-700">Step 2: Send ₱{price} to:</h3>
              <div className="bg-gray-50 rounded-xl p-4 border">
                {paymentMethod === "gcash" && (
                  <>
                    <p className="text-sm text-gray-500">GCash Number</p>
                    <p className="text-xl font-bold text-gray-800">{paymentSettings.gcashNumber}</p>
                    <p className="text-sm text-gray-500 mt-2">Account Name</p>
                    <p className="font-medium text-gray-800">{paymentSettings.gcashName}</p>
                  </>
                )}
                {paymentMethod === "paymaya" && (
                  <>
                    <p className="text-sm text-gray-500">PayMaya Number</p>
                    <p className="text-xl font-bold text-gray-800">{paymentSettings.paymayaNumber}</p>
                    <p className="text-sm text-gray-500 mt-2">Account Name</p>
                    <p className="font-medium text-gray-800">{paymentSettings.paymayaName}</p>
                  </>
                )}
                {paymentMethod === "bank" && (
                  <>
                    <p className="text-sm text-gray-500">Bank</p>
                    <p className="text-xl font-bold text-gray-800">{paymentSettings.bankName}</p>
                    <p className="text-sm text-gray-500 mt-2">Account Number</p>
                    <p className="font-medium text-gray-800">{paymentSettings.bankAccountNumber}</p>
                    <p className="text-sm text-gray-500 mt-2">Account Name</p>
                    <p className="font-medium text-gray-800">{paymentSettings.bankAccountName}</p>
                  </>
                )}
              </div>
            </div>
          )}

          {paymentMethod && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-semibold text-gray-700">Step 3: Enter Reference Number</h3>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter your payment reference/transaction number"
              />
              <button
                onClick={submitPayment}
                disabled={submitting || !referenceNumber}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "✓ I Have Paid - Submit for Verification"}
              </button>
              <p className="text-xs text-gray-500 text-center">
                Your account will be upgraded once payment is verified (usually within 24 hours)
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800">Choose Your Plan</h2>
        <p className="text-gray-500 mt-2">Unlock unlimited calculations and grow your business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <div className={`bg-white rounded-2xl shadow-sm border-2 p-8 ${user?.plan === 'free' ? 'border-blue-300' : 'border-gray-100'}`}>
          {user?.plan === 'free' && <div className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full inline-block mb-3">Current Plan</div>}
          <h3 className="text-xl font-bold text-gray-800">Free</h3>
          <div className="mt-4 mb-6">
            <span className="text-4xl font-bold text-gray-800">₱0</span>
          </div>
          <ul className="space-y-3 text-sm text-gray-600 mb-8">
            <li className="flex items-center gap-2">✅ {FREE_LIMIT} calculations total</li>
            <li className="flex items-center gap-2">✅ 3 basic calculators</li>
            <li className="flex items-center gap-2">✅ Calculation history</li>
            <li className="flex items-center gap-2 text-gray-400">❌ PRO calculators</li>
            <li className="flex items-center gap-2 text-gray-400">❌ Unlimited usage</li>
          </ul>
          <button disabled className="w-full py-3 rounded-lg border-2 border-gray-200 text-gray-400 font-semibold">
            {user?.plan === 'free' ? 'Current Plan' : 'Default'}
          </button>
        </div>

        {/* Monthly Plan */}
        <div className={`bg-white rounded-2xl shadow-lg border-2 p-8 relative ${user?.plan === 'monthly' ? 'border-green-400' : 'border-blue-400'}`}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-4 py-1 rounded-full">POPULAR</div>
          {user?.plan === 'monthly' && <div className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full inline-block mb-3">Current Plan</div>}
          <h3 className="text-xl font-bold text-gray-800">Monthly Pro</h3>
          <div className="mt-4 mb-6">
            <span className="text-4xl font-bold text-gray-800">₱{monthlyPrice}</span>
            <span className="text-gray-500 text-sm">/month</span>
          </div>
          <ul className="space-y-3 text-sm text-gray-600 mb-8">
            <li className="flex items-center gap-2">✅ Unlimited calculations</li>
            <li className="flex items-center gap-2">✅ All 12 calculators</li>
            <li className="flex items-center gap-2">✅ Full calculation history</li>
            <li className="flex items-center gap-2">✅ Priority support</li>
            <li className="flex items-center gap-2">✅ Cancel anytime</li>
          </ul>
          <button
            onClick={() => setSelectedPlan("monthly")}
            disabled={user?.plan === 'monthly'}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-50"
          >
            {user?.plan === 'monthly' ? 'Current Plan' : 'Subscribe Monthly'}
          </button>
        </div>

        {/* Lifetime Plan */}
        <div className={`bg-white rounded-2xl shadow-sm border-2 p-8 ${user?.plan === 'lifetime' ? 'border-yellow-400' : 'border-gray-100'}`}>
          {user?.plan === 'lifetime' && <div className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full inline-block mb-3">⭐ Current Plan</div>}
          <h3 className="text-xl font-bold text-gray-800">Lifetime</h3>
          <div className="mt-4 mb-6">
            <span className="text-4xl font-bold text-gray-800">₱{lifetimePrice}</span>
            <span className="text-gray-500 text-sm"> one-time</span>
          </div>
          <ul className="space-y-3 text-sm text-gray-600 mb-8">
            <li className="flex items-center gap-2">✅ Unlimited forever</li>
            <li className="flex items-center gap-2">✅ All 12 calculators</li>
            <li className="flex items-center gap-2">✅ Full calculation history</li>
            <li className="flex items-center gap-2">✅ Priority support</li>
            <li className="flex items-center gap-2">✅ Future calculators free</li>
          </ul>
          <button
            onClick={() => setSelectedPlan("lifetime")}
            disabled={user?.plan === 'lifetime'}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold transition disabled:opacity-50"
          >
            {user?.plan === 'lifetime' ? '⭐ Lifetime Member' : 'Get Lifetime Access'}
          </button>
        </div>
      </div>

      <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <p className="text-green-800 font-medium">💳 Pay via GCash, PayMaya, or Bank Transfer</p>
        <p className="text-green-600 text-sm mt-1">Select a plan above to see payment instructions</p>
      </div>
    </div>
  );
}

// ============ HISTORY VIEW ============
function HistoryView() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => setHistory(d.history || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading history...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <span className="text-6xl">📊</span>
        <h2 className="text-2xl font-bold text-gray-800 mt-4">No Calculations Yet</h2>
        <p className="text-gray-500 mt-2">Your calculation history will appear here after you use a calculator.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Calculation History</h2>
      <div className="space-y-3">
        {history.map((item) => {
          let results: Record<string, unknown> = {};
          try {
            results = JSON.parse(item.resultData);
          } catch {
            /* ignore */
          }
          return (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{item.calculatorType}</h3>
                <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                {Object.entries(results).slice(0, 4).map(([key, val]) => (
                  <span key={key} className="bg-gray-50 px-3 py-1 rounded-lg text-gray-600">
                    <span className="text-gray-400">{key}: </span>
                    {typeof val === "number" ? (key.toLowerCase().includes("rate") || key.toLowerCase().includes("roi") || key.toLowerCase().includes("yield") || key.toLowerCase().includes("ltv") || key.toLowerCase().includes("dti") || key.toLowerCase().includes("percent") ? val.toFixed(2) + "%" : formatPeso(val)) : String(val)}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
