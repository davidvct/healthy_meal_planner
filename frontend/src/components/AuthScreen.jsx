import { useMemo, useState } from "react";
import * as api from "../services/api";

function hasUppercase(password) { return /[A-Z]/.test(password); }
function hasNumber(password) { return /\d/.test(password); }
function hasSpecial(password) { return /[^A-Za-z0-9]/.test(password); }
function isStrongPassword(password) {
  return password.length >= 8 && hasUppercase(password) && hasNumber(password) && hasSpecial(password);
}

const inputStyle = {
  width: "100%", boxSizing: "border-box", padding: "11px 12px",
  borderRadius: 10, border: "1px solid var(--border)",
  background: "var(--bg)", color: "var(--text)", fontSize: 13,
  fontFamily: "var(--font)", outline: "none",
};

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const passwordChecks = useMemo(() => ({
    uppercase: hasUppercase(password),
    number: hasNumber(password),
    special: hasSpecial(password),
  }), [password]);

  const passwordErrors = useMemo(() => {
    const errs = [];
    if (password && password.length < 8) errs.push("Minimum 8 characters.");
    if (password && !passwordChecks.uppercase) errs.push("Must include 1 uppercase letter.");
    if (password && !passwordChecks.number) errs.push("Must include 1 number.");
    if (password && !passwordChecks.special) errs.push("Must include 1 special character.");
    return errs;
  }, [password, passwordChecks]);

  async function handleSendOtp() {
    setError(""); setMessage(""); setLoading(true);
    try {
      const res = await api.requestOtp(email);
      const nextMessage = res.delivery === "email"
        ? "OTP sent to your email address."
        : "OTP generated. SMTP not configured, check backend terminal logs for OTP.";
      setMessage(nextMessage);
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally { setLoading(false); }
  }

  async function handleVerifyOtp() {
    setError(""); setMessage(""); setLoading(true);
    try {
      const res = await api.verifyOtp(email, otp);
      setVerificationToken(res.verificationToken || "");
      setMessage("Email verified. You can now set your password.");
    } catch (err) {
      setError(err.message || "Failed to verify OTP");
    } finally { setLoading(false); }
  }

  async function handleRegister() {
    if (!verificationToken) { setError("Verify OTP first."); return; }
    if (!isStrongPassword(password)) { setError("Password does not meet complexity requirements."); return; }
    if (password !== confirmPassword) { setError("Password and confirm password do not match."); return; }
    setError(""); setMessage(""); setLoading(true);
    try {
      await api.registerWithOtp(email, verificationToken, password);
      setMode("login"); setLoginPassword("");
      setMessage("Registration successful. Please log in with your password.");
    } catch (err) {
      setError(err.message || "Failed to register");
    } finally { setLoading(false); }
  }

  async function handleLogin() {
    setError(""); setMessage(""); setLoading(true);
    try {
      const res = await api.login(email, loginPassword);
      onAuthenticated(res.user, res.token);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path d="M6 1S4 4.5 4 7a2 2 0 004 0C8 4.5 6 1 6 1z" fill="white"/>
              </svg>
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)" }}>MealVitals</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text3)" }}>Smart meal planning for healthier diners</div>
        </div>

        <div style={{ background: "var(--white)", borderRadius: "var(--r)", border: "1px solid var(--border)", padding: 24, boxShadow: "0 2px 12px rgba(11,34,64,.06)" }}>
          {/* Mode tabs */}
          <div style={{ display: "flex", marginBottom: 20, border: "1px solid var(--border)", borderRadius: "var(--r-sm)", overflow: "hidden" }}>
            <button onClick={() => setMode("register")} style={{ flex: 1, border: "none", background: mode === "register" ? "var(--navy)" : "transparent", color: mode === "register" ? "#fff" : "var(--text2)", fontWeight: 700, padding: "10px 12px", cursor: "pointer", fontFamily: "var(--font)", fontSize: 13 }}>
              Register
            </button>
            <button onClick={() => setMode("login")} style={{ flex: 1, border: "none", background: mode === "login" ? "var(--navy)" : "transparent", color: mode === "login" ? "#fff" : "var(--text2)", fontWeight: 700, padding: "10px 12px", cursor: "pointer", fontFamily: "var(--font)", fontSize: 13 }}>
              Login
            </button>
          </div>

          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--navy)", marginBottom: 4 }}>
            {mode === "login" ? "Welcome back" : "Create account"}
          </div>
          <p style={{ marginTop: 0, color: "var(--text3)", fontSize: 12, marginBottom: 18 }}>
            {mode === "login" ? "Not registered? " : "Already registered? "}
            <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}
              style={{ border: "none", background: "none", color: "var(--teal)", cursor: "pointer", fontWeight: 700, padding: 0, fontFamily: "var(--font)", fontSize: 12 }}>
              {mode === "login" ? "Sign up here" : "Back to login"}
            </button>
          </p>

          <label style={{ display: "block", color: "var(--text2)", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
            style={{ ...inputStyle, marginBottom: 12 }} />

          {mode === "register" ? (
            <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP"
                  style={{ ...inputStyle, flex: 1 }} />
                <button type="button" onClick={handleSendOtp} disabled={loading || !email}
                  style={{ border: "none", borderRadius: 10, padding: "0 12px", background: "var(--teal)", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font)", fontSize: 12 }}>
                  Send OTP
                </button>
                <button type="button" onClick={handleVerifyOtp} disabled={loading || !email || !otp}
                  style={{ border: "none", borderRadius: 10, padding: "0 12px", background: "var(--green)", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font)", fontSize: 12 }}>
                  Verify
                </button>
              </div>

              <label style={{ display: "block", color: "var(--text2)", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Password</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input type={showRegisterPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 chars"
                  style={{ ...inputStyle, flex: 1, borderColor: passwordErrors.length ? "var(--red)" : "var(--border)" }} />
                <button type="button" onClick={() => setShowRegisterPassword(v => !v)}
                  style={{ border: "1px solid var(--border)", borderRadius: 10, background: "var(--white)", color: "var(--text2)", fontWeight: 600, padding: "0 12px", cursor: "pointer", fontFamily: "var(--font)", fontSize: 12 }}>
                  {showRegisterPassword ? "Hide" : "Show"}
                </button>
              </div>
              {passwordErrors.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  {passwordErrors.map(e => <div key={e} style={{ color: "var(--red)", fontSize: 12 }}>{e}</div>)}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  style={{ ...inputStyle, flex: 1, borderColor: confirmPassword && confirmPassword !== password ? "var(--red)" : "var(--border)" }} />
                <button type="button" onClick={() => setShowConfirmPassword(v => !v)}
                  style={{ border: "1px solid var(--border)", borderRadius: 10, background: "var(--white)", color: "var(--text2)", fontWeight: 600, padding: "0 12px", cursor: "pointer", fontFamily: "var(--font)", fontSize: 12 }}>
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <div style={{ color: "var(--red)", fontSize: 12, marginBottom: 8 }}>Passwords do not match.</div>
              )}

              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 14, lineHeight: 1.8 }}>
                Requirements:
                <span style={{ color: passwordChecks.uppercase ? "var(--green)" : "var(--text3)", marginLeft: 4 }}>uppercase</span> ·
                <span style={{ color: passwordChecks.number ? "var(--green)" : "var(--text3)", marginLeft: 4 }}>number</span> ·
                <span style={{ color: passwordChecks.special ? "var(--green)" : "var(--text3)", marginLeft: 4 }}>special char</span>
              </div>

              <button type="submit" disabled={loading || !email || !verificationToken}
                style={{ width: "100%", border: "none", borderRadius: 10, padding: "12px", background: "var(--navy)", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font)", fontSize: 13 }}>
                Create Account
              </button>
            </form>
          ) : (
            <>
              <label style={{ display: "block", color: "var(--text2)", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Password</label>
              <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  <input type={showLoginPassword ? "text" : "password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{ ...inputStyle, flex: 1 }} />
                  <button type="button" onClick={() => setShowLoginPassword(v => !v)}
                    style={{ border: "1px solid var(--border)", borderRadius: 10, background: "var(--white)", color: "var(--text2)", fontWeight: 600, padding: "0 12px", cursor: "pointer", fontFamily: "var(--font)", fontSize: 12 }}>
                    {showLoginPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <button type="submit" disabled={loading || !email || !loginPassword}
                  style={{ width: "100%", border: "none", borderRadius: 10, padding: "12px", background: "var(--navy)", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font)", fontSize: 13, opacity: (loading || !email || !loginPassword) ? 0.6 : 1 }}>
                  {loading ? "Signing in…" : "Login"}
                </button>
              </form>
            </>
          )}

          {message && <p style={{ marginTop: 12, color: "var(--green)", fontSize: 12, margin: "12px 0 0" }}>{message}</p>}
          {error && <p style={{ marginTop: 12, color: "var(--red)", fontSize: 12, margin: "12px 0 0" }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}
