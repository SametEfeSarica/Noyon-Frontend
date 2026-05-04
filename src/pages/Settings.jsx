import { useState, useEffect, useCallback } from "react";

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
  bell:       ["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9", "M13.73 21a2 2 0 0 1-3.46 0"],
  palette:    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
  shield:     ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  eye:        ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  eyeOff:     ["M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24", "M1 1l22 22"],
  check:      "M20 6L9 17l-5-5",
  x:          "M18 6L6 18M6 6l12 12",
  chevRight:  "M9 18l6-6-6-6",
  trash:      ["M3 6h18", "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"],
  globe:      ["M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z","M2 12h20","M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"],
  moon:       "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  zap:        "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  info:       ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M12 8v4","M12 16h.01"],
  logout:     ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4","M16 17l5-5-5-5","M21 12H9"],
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

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, color = "#6c6af6" }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      className="relative flex-shrink-0 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6c6af6]/60"
      style={{
        width: 36, height: 20,
        background: checked ? color : "#1e1e2c",
      }}>
      <span
        className="absolute top-[3px] rounded-full bg-white shadow-sm transition-all duration-200"
        style={{
          width: 14, height: 14,
          left: checked ? "calc(100% - 17px)" : "3px",
        }}
      />
    </button>
  );
}

// ─── Notification Row ─────────────────────────────────────────────────────────
function NotifRow({ label, description, checked, onChange, color }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b last:border-0"
      style={{ borderColor: "#1e1e2c" }}>
      <div className="min-w-0">
        <p className="text-sm text-gray-300 font-medium">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} color={color} />
    </div>
  );
}

// ─── Theme Option ─────────────────────────────────────────────────────────────
function ThemeOption({ id, label, active, onClick, preview }) {
  return (
    <button
      onClick={() => onClick(id)}
      className="relative flex flex-col items-center gap-2 rounded-xl p-3 transition-all duration-150 group"
      style={{
        background: active ? "#161622" : "#09090b",
        border: `1px solid ${active ? "#6c6af666" : "#1e1e2c"}`,
        boxShadow: active ? "0 0 16px #6c6af622" : "none",
      }}>
      <div className="w-full h-12 rounded-lg overflow-hidden" style={{ ...preview }}>
        <div className="w-full h-full flex items-end p-1.5 gap-1">
          <div className="h-1.5 flex-1 rounded-full opacity-60" style={{ background: "#fff" }} />
          <div className="h-1.5 w-6 rounded-full opacity-30" style={{ background: "#fff" }} />
        </div>
      </div>
      <span className="text-xs font-medium" style={{ color: active ? "#d0d0e0" : "#6b7280" }}>
        {label}
      </span>
      {active && (
        <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ background: "#6c6af6" }}>
          <IC d={P.check} size={8} className="text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

const ACCENTS = [
  { id: "violet", color: "#6c6af6", label: "Violet" },
  { id: "indigo", color: "#4f46e5", label: "Indigo" },
  { id: "sky",    color: "#0ea5e9", label: "Sky" },
  { id: "emerald",color: "#10b981", label: "Emerald" },
  { id: "amber",  color: "#f59e0b", label: "Amber" },
  { id: "rose",   color: "#f43f5e", label: "Rose" },
];

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

const SECTIONS = [
  { id: "profile",       label: "Profil",       icon: P.user,    color: "#a78bfa" },
  { id: "account",       label: "Hesap",        icon: P.shield,  color: "#60a5fa" },
  { id: "notifications", label: "Bildirimler",  icon: P.bell,    color: "#f59e0b" },
  { id: "appearance",    label: "Görünüm",      icon: P.palette, color: "#f472b6" },
  { id: "privacy",       label: "Gizlilik",     icon: P.lock,    color: "#34d399" },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState("profile");
  const [toast, setToast] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Profile
  const [displayName, setDisplayName] = useState("User");
  const [email, setEmail] = useState("user@noyon.app");
  const [bio, setBio] = useState("Noyon kullanıcısı.");
  const [website, setWebsite] = useState("");

  // Password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState({
    taskReminders:  true,
    weeklyDigest:   true,
    mentions:       true,
    systemUpdates:  false,
    marketing:      false,
    mobileEnabled:  true,
    emailEnabled:   true,
  });

  // Appearance
  const [theme, setTheme] = useState("dark");
  const [accent, setAccent] = useState("violet");
  const [compactMode, setCompactMode] = useState(false);
  const [animations, setAnimations] = useState(true);
  const [sidebarBlur, setSidebarBlur] = useState(true);

  // Privacy
  const [privacy, setPrivacy] = useState({
    publicProfile:  false,
    showActivity:   true,
    showStreak:     true,
    analyticsOpt:   false,
  });

  useEffect(() => { setMounted(true); }, []);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
  }, []);

  const handleSaveProfile = () => {
    if (!displayName.trim()) { showToast("İsim boş olamaz.", "error"); return; }
    if (!email.includes("@")) { showToast("Geçerli bir e-posta girin.", "error"); return; }
    showToast("Profil güncellendi.");
  };

  const handleChangePassword = () => {
    if (!currentPw) { showToast("Mevcut şifrenizi girin.", "error"); return; }
    if (newPw.length < 8) { showToast("Şifre en az 8 karakter olmalı.", "error"); return; }
    if (newPw !== confirmPw) { showToast("Şifreler eşleşmiyor.", "error"); return; }
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    showToast("Şifre değiştirildi.");
  };

  const handleSaveNotifs = () => showToast("Bildirim tercihleri kaydedildi.");
  const handleSaveAppearance = () => showToast("Görünüm ayarları uygulandı.");
  const handleSavePrivacy = () => showToast("Gizlilik ayarları güncellendi.");

  const accentColor = ACCENTS.find(a => a.id === accent)?.color ?? "#6c6af6";

  const renderSection = () => {
    switch (activeSection) {
      case "profile": return (
        <div className="flex flex-col gap-5">
          <SectionCard title="Kişisel Bilgiler" description="Sistemde nasıl göründüğünüzü ayarlayın." icon={P.user} iconColor="#a78bfa">
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
                  style={{ background: "#161622", border: "1px solid #1e1e2c",
                    fontFamily: "inherit" }}
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
              <SaveButton onClick={handleSaveProfile} accentColor={accentColor} />
            </div>
          </SectionCard>
        </div>
      );

      case "account": return (
        <div className="flex flex-col gap-5">
          <SectionCard title="Şifre Değiştir" description="Hesabınızı güvende tutmak için şifrenizi güncelleyin." icon={P.lock} iconColor="#60a5fa">
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
                  prefix={<IC d={P.check} size={14} className={confirmPw && confirmPw === newPw ? "text-emerald-500" : "text-gray-500"} />}
                  suffix={
                    <button onClick={() => setShowConfirm(v => !v)} className="text-gray-500 hover:text-gray-400">
                      <IC d={showConfirm ? P.eyeOff : P.eye} size={14} />
                    </button>
                  } />
              </Field>
              <div className="pt-2 flex justify-end">
                <SaveButton label="Şifreyi Güncelle" onClick={handleChangePassword} accentColor={accentColor} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Tehlikeli Bölge" description="Geri alınamaz hesap işlemleri." icon={P.trash} iconColor="#ef4444">
            <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-red-500/20" style={{ background: '#110909' }}>
              <div>
                <p className="text-sm font-medium text-gray-300">Hesabı Sil</p>
                <p className="text-xs text-gray-500 mt-0.5">Tüm verilerinizi kalıcı olarak siler. Geri alınamaz.</p>
              </div>
              <button
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

      case "notifications": return (
        <div className="flex flex-col gap-5">
          <SectionCard title="Uygulama İçi Bildirimler" description="Noyon içinde göreceğiniz uyarıları ayarlayın." icon={P.bell} iconColor="#f59e0b">
            <NotifRow label="Görev Hatırlatıcıları" description="Yaklaşan ve geciken görevler için uyarılar." checked={notifs.taskReminders} color="#f59e0b" onChange={v => setNotifs(p => ({ ...p, taskReminders: v }))} />
            <NotifRow label="Haftalık Özet" description="Her pazartesi haftanızın özeti." checked={notifs.weeklyDigest} color="#f59e0b" onChange={v => setNotifs(p => ({ ...p, weeklyDigest: v }))} />
          </SectionCard>
          <div className="flex justify-end">
            <SaveButton label="Tercihleri Kaydet" onClick={handleSaveNotifs} accentColor={accentColor} />
          </div>
        </div>
      );

      case "appearance": return (
        <div className="flex flex-col gap-5">
          <SectionCard title="Tema" description="Görsel temayı seçin." icon={P.moon} iconColor="#f472b6">
            <div className="grid grid-cols-3 gap-3">
              <ThemeOption id="dark" label="Noyon Siyahı" active={theme === "dark"} onClick={setTheme} preview={{ background: "linear-gradient(135deg, #09090b, #111119)" }} />
              <ThemeOption id="midnight" label="Gece" active={theme === "midnight"} onClick={setTheme} preview={{ background: "linear-gradient(135deg, #050510, #0d0d1a)" }} />
              <ThemeOption id="light" label="Açık" active={theme === "light"} onClick={setTheme} preview={{ background: "linear-gradient(135deg, #f5f5f5, #e8e8ee)" }} />
            </div>
          </SectionCard>

          <SectionCard title="Vurgu Rengi" description="Aktif öğeler için kullanılacak ana renk." icon={P.palette} iconColor="#f472b6">
            <div className="flex flex-wrap gap-3">
              {ACCENTS.map(a => (
                <button key={a.id} onClick={() => setAccent(a.id)} title={a.label}
                  className="relative w-8 h-8 rounded-full transition-all duration-150"
                  style={{ background: a.color, boxShadow: accent === a.id ? `0 0 0 2px #09090b, 0 0 0 4px ${a.color}` : "none", transform: accent === a.id ? "scale(1.15)" : "scale(1)" }}>
                  {accent === a.id && <span className="absolute inset-0 flex items-center justify-center"><IC d={P.check} size={12} className="text-white" strokeWidth={3} /></span>}
                </button>
              ))}
            </div>
          </SectionCard>

          <div className="flex justify-end">
            <SaveButton label="Görünümü Uygula" onClick={handleSaveAppearance} accentColor={accentColor} />
          </div>
        </div>
      );

      case "privacy": return (
        <div className="flex flex-col gap-5">
          <SectionCard title="Veri İndirme" description="Tüm verilerinizin bir kopyasını bilgisayarınıza indirin." icon={P.logout} iconColor="#34d399">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-300">Tüm verileri dışa aktar</p>
                <p className="text-xs text-gray-500 mt-0.5">Notlar, görevler, abonelikler — ZIP arşivi olarak.</p>
              </div>
              <button
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors"
                style={{ background: "#34d39922", color: "#34d399", border: "1px solid #34d39933" }}
                onMouseEnter={e => e.currentTarget.style.background = "#34d39933"}
                onMouseLeave={e => e.currentTarget.style.background = "#34d39922"}>
                <IC d={P.logout} size={12} /> ZIP İndir
              </button>
            </div>
          </SectionCard>
          <div className="flex justify-end">
            <SaveButton label="Gizliliği Kaydet" onClick={handleSavePrivacy} accentColor={accentColor} />
          </div>
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
                    style={{ background: active ? "#111119" : "transparent", border: `1px solid ${active ? "#1e1e2c" : "transparent"}`, color: active ? "#e0e0ea" : "#606070" }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#111119"; e.currentTarget.style.color = "#b0b0c0"; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#606070"; } }}>
                    <span className="flex-shrink-0" style={{ color: active ? s.color : "currentColor" }}><IC d={s.icon} size={14} /></span>
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
    </div>
  );
}

function SaveButton({ label = "Kaydet", onClick, accentColor = "#6c6af6" }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
      style={{ background: hov ? accentColor : accentColor + "22", color: hov ? "#fff" : accentColor, border: `1px solid ${accentColor}44`, transform: hov ? "translateY(-1px)" : "none" }}>
      <IC d={P.check} size={13} strokeWidth={2.5} />
      {label}
    </button>
  );
}