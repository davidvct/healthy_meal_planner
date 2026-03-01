import { useMemo, useState } from "react";
import { COLORS } from "../constants/colors";
import * as api from "../services/api";

function hasUppercase(password) {
  return /[A-Z]/.test(password);
}

function hasNumber(password) {
  return /\d/.test(password);
}

function hasSpecial(password) {
  return /[^A-Za-z0-9]/.test(password);
}

function isStrongPassword(password) {
  return password.length >= 8 && hasUppercase(password) && hasNumber(password) && hasSpecial(password);
}

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
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await api.requestOtp(email);
      if (res.delivery === "console") {
        setMessage("OTP generated. SMTP not configured, check backend terminal logs for OTP.");
      } else {
        setMessage("OTP sent to your email address.");
      }
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await api.verifyOtp(email, otp);
      setVerificationToken(res.verificationToken || "");
      setMessage("Email verified. You can now set your password.");
    } catch (err) {
      setError(err.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (!verificationToken) {
      setError("Verify OTP first.");
      return;
    }
    if (!isStrongPassword(password)) {
      setError("Password does not meet complexity requirements.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);
    try {
      await api.registerWithOtp(email, verificationToken, password);
      setMode("login");
      setLoginPassword("");
      setMessage("Registration successful. Please log in with your password.");
    } catch (err) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await api.login(email, loginPassword);
      onAuthenticated(res.user, res.token);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 460, background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.grayLight}`, padding: 24 }}>
        <div style={{ display: "flex", marginBottom: 20, border: `1px solid ${COLORS.grayLight}`, borderRadius: 10, overflow: "hidden" }}>
          <button
            onClick={() => setMode("register")}
            style={{
              flex: 1,
              border: "none",
              background: mode === "register" ? COLORS.navy : "transparent",
              color: mode === "register" ? "#fff" : COLORS.gray,
              fontWeight: 700,
              padding: "10px 12px",
              cursor: "pointer",
            }}
          >
            Register
          </button>
          <button
            onClick={() => setMode("login")}
            style={{
              flex: 1,
              border: "none",
              background: mode === "login" ? COLORS.navy : "transparent",
              color: mode === "login" ? "#fff" : COLORS.gray,
              fontWeight: 700,
              padding: "10px 12px",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </div>

        <h1 style={{ margin: 0, color: COLORS.navy, fontSize: 22, marginBottom: 8 }}>MealWise Account</h1>
        {mode === "login" ? (
          <p style={{ marginTop: 0, color: COLORS.gray, fontSize: 13, marginBottom: 18 }}>
            Not a registered user?{" "}
            <button
              type="button"
              onClick={() => setMode("register")}
              style={{ border: "none", background: "none", color: COLORS.accent, cursor: "pointer", fontWeight: 700, padding: 0 }}
            >
              Simply sign up here
            </button>
          </p>
        ) : (
          <p style={{ marginTop: 0, color: COLORS.gray, fontSize: 13, marginBottom: 18 }}>
            Already registered?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              style={{ border: "none", background: "none", color: COLORS.accent, cursor: "pointer", fontWeight: 700, padding: 0 }}
            >
              Back to login
            </button>
          </p>
        )}

        <label style={{ display: "block", color: COLORS.gray, fontSize: 12, marginBottom: 6 }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px", borderRadius: 10, border: `1px solid ${COLORS.grayLight}`, marginBottom: 12 }}
        />

        {mode === "register" ? (
          <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                style={{ flex: 1, boxSizing: "border-box", padding: "11px 12px", borderRadius: 10, border: `1px solid ${COLORS.grayLight}` }}
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || !email}
                style={{ border: "none", borderRadius: 10, padding: "0 12px", background: COLORS.accent, color: "#fff", fontWeight: 700, cursor: "pointer" }}
              >
                Send OTP
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loading || !email || !otp}
                style={{ border: "none", borderRadius: 10, padding: "0 12px", background: COLORS.green, color: "#fff", fontWeight: 700, cursor: "pointer" }}
              >
                Verify
              </button>
            </div>

            <label style={{ display: "block", color: COLORS.gray, fontSize: 12, marginBottom: 6 }}>Password</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                type={showRegisterPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 chars"
                style={{ flex: 1, width: "100%", boxSizing: "border-box", padding: "11px 12px", borderRadius: 10, border: `1px solid ${passwordErrors.length ? COLORS.warn : COLORS.grayLight}` }}
              />
              <button
                type="button"
                onClick={() => setShowRegisterPassword((v) => !v)}
                style={{ border: `1px solid ${COLORS.grayLight}`, borderRadius: 10, background: "#fff", color: COLORS.navy, fontWeight: 600, padding: "0 12px", cursor: "pointer" }}
              >
                {showRegisterPassword ? "Hide" : "Show"}
              </button>
            </div>
            {passwordErrors.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                {passwordErrors.map((e) => (
                  <div key={e} style={{ color: COLORS.warn, fontSize: 12 }}>{e}</div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                style={{ flex: 1, width: "100%", boxSizing: "border-box", padding: "11px 12px", borderRadius: 10, border: `1px solid ${confirmPassword && confirmPassword !== password ? COLORS.warn : COLORS.grayLight}` }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                style={{ border: `1px solid ${COLORS.grayLight}`, borderRadius: 10, background: "#fff", color: COLORS.navy, fontWeight: 600, padding: "0 12px", cursor: "pointer" }}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <div style={{ color: COLORS.warn, fontSize: 12, marginBottom: 8 }}>Password and confirm password do not match.</div>
            )}

            <div style={{ fontSize: 12, color: COLORS.gray, marginBottom: 12 }}>
              <div>Requirements:</div>
              <div style={{ color: passwordChecks.uppercase ? COLORS.green : COLORS.gray }}>- 1 uppercase letter</div>
              <div style={{ color: passwordChecks.number ? COLORS.green : COLORS.gray }}>- 1 number</div>
              <div style={{ color: passwordChecks.special ? COLORS.green : COLORS.gray }}>- 1 special character</div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !verificationToken}
              style={{ width: "100%", border: "none", borderRadius: 10, padding: "11px 12px", background: COLORS.navy, color: "#fff", fontWeight: 700, cursor: "pointer" }}
            >
              Create Account
            </button>
          </form>
        ) : (
          <>
            <label style={{ display: "block", color: COLORS.gray, fontSize: 12, marginBottom: 6 }}>Password</label>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input
                  type={showLoginPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{ flex: 1, width: "100%", boxSizing: "border-box", padding: "11px 12px", borderRadius: 10, border: `1px solid ${COLORS.grayLight}` }}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((v) => !v)}
                  style={{ border: `1px solid ${COLORS.grayLight}`, borderRadius: 10, background: "#fff", color: COLORS.navy, fontWeight: 600, padding: "0 12px", cursor: "pointer" }}
                >
                  {showLoginPassword ? "Hide" : "Show"}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading || !email || !loginPassword}
                style={{ width: "100%", border: "none", borderRadius: 10, padding: "11px 12px", background: COLORS.navy, color: "#fff", fontWeight: 700, cursor: "pointer" }}
              >
                Login
              </button>
            </form>
          </>
        )}

        {message && <p style={{ marginTop: 12, color: COLORS.green, fontSize: 12 }}>{message}</p>}
        {error && <p style={{ marginTop: 12, color: COLORS.warn, fontSize: 12 }}>{error}</p>}
      </div>
    </div>
  );
}
