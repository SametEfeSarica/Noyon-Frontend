import { useState, useEffect, useCallback } from "react";
import api from "../api/axiosInstance";

// ─── SVG Icon Primitive ───────────────────────────────────────────────────────
const IC = ({ d, size = 16, fill = "none", className = "", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    {Array.isArray(d)
      ? d.map((p, i) => <path key={i} d={p} />)
      : <path d={d} />}
  </svg>
);

// ─── Icon Paths ───────────────────────────────────────────────────────────────
const P = {
  user:       ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  mail:       ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M22 6l-10 7L2 6"],
  lock:       ["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z", "M7 11V7a5 5 0 0 1 10 0v4"],
  shield:     ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  eye:        ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  eyeOff:     ["M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24", "M1 1l22 22"],
  check:      "M20 6L9 17l-5-5",
  x:          "M18 6L6 18M6 6l12 12",
  trash:      ["M3 6h18", "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"],
  globe:      ["M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z","M2 12h20","M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"],
  loader:     ["M12 2v4", "M12 18v4", "M4.93 4.93l2.83 2.83", "M16.24 16.24l2.83 2.83", "M2 12h4", "M18 12h4", "M4.93 19.07l2.83-2.83", "M16.24 7.76l2.83-2.83"],
};

// ─── Toast Notification ───────────────────────────────────────────────────────
function Toast({ message, type = "success", onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl"
      style={{
        background: "#111119",
        border: `1px solid ${type === "success" ? "#34d39933" : "#ef444433"}`,
        animation: "toastIn 0.3s cubic-bezier(0.22,1,0.36,1) both",
      }}>
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: type === "success" ? "#34d39922" : "#ef444422",
          color: type === "success" ? "#34d399" : "#ef4444" }}>
        <IC d={type === "success" ? P.check : P.x} size={12} strokeWidth={2.5} />
      </div>
      <span className="text-sm text-gray-300">{message}</span>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, description, icon, iconColor = "#6c6af6", children, badge }) {
  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{ background: "#111119", border: "1px solid #1e1e2c" }}>
      <div className="flex items-start gap-3.5 px-5 py-4 border-b" style={{ borderColor: "#1e1e2c" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: iconColor + "18", color: iconColor }}>
          <IC d={icon} size={15} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {badge && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: iconColor + "22", color: iconColor }}>
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-500 tracking-wide uppercase">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-gray-600 leading-snug">{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder, prefix, suffix, disabled, autoComplete }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative flex items-center rounded-lg overflow-hidden transition-all duration-150"
      style={{
        background: disabled ? "#09090b" : "#161622",
        border: `1px solid ${focused ? "#6c6af644" : "#1e1e2c"}`,
        boxShadow: focused ? "0 0 0 3px #6c6af612" : "none",
        opacity: disabled ? 0.5 : 1,
      }}>
      {prefix && (
        <div className="flex items-center pl-3 flex-shrink-0 text-gray-500">{prefix}</div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none"
        style={{ fontFamily: "inherit" }}
      />
      {suffix && (
        <div className="flex items-center pr-3 flex-shrink-0">{suffix}</div>
      )}
    </div>
  );
}

// ─── Password Strength ────────────────────────────────────────────────────────
function PasswordStrength({ password }) {
  const score = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8)  s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const labels = ["", "Zayıf", "Orta", "İyi", "Güçlü", "Çok Güçlü"];
  const colors = ["", "#ef4444", "#f59e0b", "#eab308", "#34d399", "#10b981"];

  if (!password) return null;

  return (
    <div className="flex items-center gap-3 mt-1.5">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? colors[score] : "#1e1e2c" }} />
        ))}
      </div>
      <span className="text-[11px] font-medium flex-shrink-0" style={{ color: colors[score] }}>
        {labels[score]}
      </span>
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="rounded-2xl p-6 max-w-sm w-full mx-4"
        style={{ background: "#111119", border: "1px solid #ef444433" }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "#ef444418", color: "#ef4444" }}>
          <IC d={P.trash} size={20} />
        </div>
        <h3 className="text-base font-semibold text-white text-center mb-2">Hesabı Sil</h3>
        <p className="text-sm text-gray-400 text-center mb-6 leading-relaxed">
          Tüm verileriniz kalıcı olarak silinecek. Bu işlem <span className="text-red-400 font-medium">geri alınamaz</span>.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ background: "#1e1e2c", color: "#9ca3af", border: "1px solid #2a2a38" }}>
            İptal
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            style={{ background: "#ef4444", color: "#fff" }}>
            {loading ? <Spinner size={14} /> : <IC d={P.trash} size={14} />}
            Evet, Sil
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round"
      style={{ animation: "spin 0.8s linear infinite" }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

// ─── Save Button ──────────────────────────────────────────────────────────────
function SaveButton({ label = "Kaydet", onClick, accentColor = "#6c6af6", loading = false }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={loading}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
      style={{
        background: hov ? accentColor : accentColor + "22",
        color: hov ? "#fff" : accentColor,
        border: `1px solid ${accentColor}44`,
        transform: hov ? "translateY(-1px)" : "none",
        opacity: loading ? 0.7 : 1,
        cursor: loading ? "not-allowed" : "pointer",
      }}>
      {loading ? <Spinner size={13} /> : <IC d={P.check} size={13} strokeWidth={2.5} />}
      {label}
    </button>
  );
}

const SECTIONS = [
  { id: "profile", label: "Profil",  icon: P.user,   color: "#a78bfa" },
  { id: "account", label: "Hesap",   icon: P.shield, color: "#60a5fa" },
];

const accentColor = "#6c6af6";

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Settings() {
  const [activeSection, setActiveSection] = useState("profile");
  const [toast, setToast] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Profile
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchProfile();
  }, []);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
  }, []);

  // ─── API Calls ──────────────────────────────────────────────────────────────

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const res = await api.get("/api/users/profile");
      const data = res.data.data; // ApiResponse wrapper: { data: UserResponse }
      setDisplayName(data.displayName ?? "");
      setEmail(data.email ?? "");
      setBio(data.bio ?? "");
      setWebsite(data.website ?? "");
    } catch (err) {
      showToast("Profil bilgileri alınamadı.", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) { showToast("İsim boş olamaz.", "error"); return; }
    if (!email.includes("@")) { showToast("Geçerli bir e-posta girin.", "error"); return; }
    try {
      setSavingProfile(true);
      await api.put("/api/users/profile", {
        displayName: displayName.trim(),
        email: email.trim(),
        bio: bio.trim(),
        website: website.trim(),
      });
      showToast("Profil güncellendi.");
    } catch (err) {
      const msg = err.response?.data?.message ?? "Profil güncellenemedi.";
      showToast(msg, "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPw) { showToast("Mevcut şifrenizi girin.", "error"); return; }
    if (newPw.length < 8) { showToast("Şifre en az 8 karakter olmalı.", "error"); return; }
    if (newPw !== confirmPw) { showToast("Şifreler eşleşmiyor.", "error"); return; }
    try {
      setSavingPw(true);
      await api.post("/api/users/change-password", {
        currentPassword: currentPw,
        newPassword: newPw,
      });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      showToast("Şifre değiştirildi.");
    } catch (err) {
      const msg = err.response?.data?.message ?? "Şifre değiştirilemedi.";
      showToast(msg, "error");
    } finally {
      setSavingPw(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeletingAccount(true);
      await api.delete("/api/users/me");
      localStorage.clear();
      window.location.href = "/login";
    } catch (err) {
      const msg = err.response?.data?.message ?? "Hesap silinemedi.";
      showToast(msg, "error");
      setShowDeleteModal(false);
    } finally {
      setDeletingAccount(false);
    }
  };

  // ─── Render Sections ────────────────────────────────────────────────────────
  const renderSection = () => {
    switch (activeSection) {
      case "profile": return (
        <div className="flex flex-col gap-5">
          <SectionCard title="Kişisel Bilgiler" description="Sistemde nasıl göründüğünüzü ayarlayın."
            icon={P.user} iconColor="#a78bfa">
            {profileLoading ? (
              <div className="flex items-center justify-center py-10 text-gray-500 gap-3">
                <Spinner size={18} />
                <span className="text-sm">Profil yükleniyor…</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Görünen İsim">
                    <Input value={displayName} onChange={e => setDisplayName(e.target.value)}
                      placeholder="İsminiz"
                      prefix={<IC d={P.user} size={14} className="text-gray-500" />} />
                  </Field>
                  <Field label="E-posta Adresi">
                    <Input value={email} onChange={e => setEmail(e.target.value)}
                      type="email" placeholder="ornek@mail.com" autoComplete="email"
                      prefix={<IC d={P.mail} size={14} className="text-gray-500" />} />
                  </Field>
                  <Field label="Hakkında" hint="Kısa bir biyografi yazabilirsiniz.">
                    <textarea
                      value={bio} onChange={e => setBio(e.target.value)}
                      rows={2} placeholder="Kendinizden bahsedin..."
                      className="w-full rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none transition-all duration-150"
                      style={{ background: "#161622", border: "1px solid #1e1e2c", fontFamily: "inherit" }}
                      onFocus={e => { e.currentTarget.style.borderColor = "#6c6af644"; e.currentTarget.style.boxShadow = "0 0 0 3px #6c6af612"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "#1e1e2c"; e.currentTarget.style.boxShadow = "none"; }} />
                  </Field>
                  <Field label="Web Sitesi">
                    <Input value={website} onChange={e => setWebsite(e.target.value)}
                      placeholder="siteniz.com"
                      prefix={<IC d={P.globe} size={14} className="text-gray-500" />} />
                  </Field>
                </div>
                <div className="mt-5 flex items-center justify-end gap-2 pt-4 border-t" style={{ borderColor: "#1e1e2c" }}>
                  <SaveButton onClick={handleSaveProfile} accentColor={accentColor} loading={savingProfile} />
                </div>
              </>
            )}
          </SectionCard>
        </div>
      );

      case "account": return (
        <div className="flex flex-col gap-5">
          <SectionCard title="Şifre Değiştir" description="Hesabınızı güvende tutmak için şifrenizi güncelleyin."
            icon={P.lock} iconColor="#60a5fa">
            <div className="flex flex-col gap-4 max-w-md">
              <Field label="Mevcut Şifre">
                <Input value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                  type={showCurrent ? "text" : "password"} placeholder="••••••••"
                  prefix={<IC d={P.lock} size={14} className="text-gray-500" />}
                  suffix={
                    <button onClick={() => setShowCurrent(v => !v)} className="text-gray-500 hover:text-gray-400">
                      <IC d={showCurrent ? P.eyeOff : P.eye} size={14} />
                    </button>
                  } />
              </Field>
              <Field label="Yeni Şifre" hint="En az 8 karakter olmalıdır.">
                <Input value={newPw} onChange={e => setNewPw(e.target.value)}
                  type={showNew ? "text" : "password"} placeholder="••••••••"
                  prefix={<IC d={P.shield} size={14} className="text-gray-500" />}
                  suffix={
                    <button onClick={() => setShowNew(v => !v)} className="text-gray-500 hover:text-gray-400">
                      <IC d={showNew ? P.eyeOff : P.eye} size={14} />
                    </button>
                  } />
                <PasswordStrength password={newPw} />
              </Field>
              <Field label="Yeni Şifre (Tekrar)">
                <Input value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  type={showConfirm ? "text" : "password"} placeholder="••••••••"
                  prefix={<IC d={P.check} size={14}
                    className={confirmPw && confirmPw === newPw ? "text-emerald-500" : "text-gray-500"} />}
                  suffix={
                    <button onClick={() => setShowConfirm(v => !v)} className="text-gray-500 hover:text-gray-400">
                      <IC d={showConfirm ? P.eyeOff : P.eye} size={14} />
                    </button>
                  } />
              </Field>
              <div className="pt-2 flex justify-end">
                <SaveButton label="Şifreyi Güncelle" onClick={handleChangePassword}
                  accentColor={accentColor} loading={savingPw} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Tehlikeli Bölge" description="Geri alınamaz hesap işlemleri."
            icon={P.trash} iconColor="#ef4444">
            <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-red-500/20"
              style={{ background: '#110909' }}>
              <div>
                <p className="text-sm font-medium text-gray-300">Hesabı Sil</p>
                <p className="text-xs text-gray-500 mt-0.5">Tüm verilerinizi kalıcı olarak siler. Geri alınamaz.</p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex-shrink-0 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors"
                style={{ background: "#ef444422", color: "#ef4444", border: "1px solid #ef444433" }}
                onMouseEnter={e => e.currentTarget.style.background = "#ef444433"}
                onMouseLeave={e => e.currentTarget.style.background = "#ef444422"}>
                Hesabı Sil
              </button>
            </div>
          </SectionCard>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="min-h-full" style={{ background: "#09090b", color: "#e5e7eb", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(12px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .fade-up { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .d1 { animation-delay: 0.04s; } .d2 { animation-delay: 0.10s; }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className={`mb-8 fade-up d1 ${mounted ? "" : "opacity-0"}`}>
          <h1 className="text-2xl font-bold text-white tracking-tight">Ayarlar</h1>
          <p className="text-sm text-gray-500 mt-1">Profilinizi, görünümü ve tercihlerinizi yönetin.</p>
        </div>

        <div className={`flex flex-col lg:flex-row gap-6 fade-up d2 ${mounted ? "" : "opacity-0"}`}>
          <aside className="lg:w-52 flex-shrink-0">
            <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
              {SECTIONS.map(s => {
                const active = activeSection === s.id;
                return (
                  <button key={s.id} onClick={() => setActiveSection(s.id)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left whitespace-nowrap lg:whitespace-normal transition-colors flex-shrink-0 lg:flex-shrink"
                    style={{
                      background: active ? "#111119" : "transparent",
                      border: `1px solid ${active ? "#1e1e2c" : "transparent"}`,
                      color: active ? "#e0e0ea" : "#606070"
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#111119"; e.currentTarget.style.color = "#b0b0c0"; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#606070"; } }}>
                    <span className="flex-shrink-0" style={{ color: active ? s.color : "currentColor" }}>
                      <IC d={s.icon} size={14} />
                    </span>
                    <span className="text-[13px] font-[450] leading-none">{s.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="flex-1 min-w-0">
            <div key={activeSection} className="fade-up d1">
              {renderSection()}
            </div>
          </main>
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      {showDeleteModal && (
        <ConfirmModal
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
          loading={deletingAccount}
        />
      )}
    </div>
  );
}
