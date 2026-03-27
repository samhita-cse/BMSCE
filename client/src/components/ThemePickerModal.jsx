import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const PAYMENT_OPTIONS = [
  "UPI",
  "Visa / Mastercard",
  "RuPay",
  "Net Banking",
  "Wallet"
];

export function ThemePickerModal({ open, onClose }) {
  const { currentTheme, hasPremium, selectTheme, themes, unlockPremiumDemo } = useTheme();
  const [lockedThemeId, setLockedThemeId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_OPTIONS[0]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!open) {
    return null;
  }

  const handleThemeSelect = (themeId, premium) => {
    if (!premium || hasPremium) {
      selectTheme(themeId);
      setLockedThemeId("");
      return;
    }

    setLockedThemeId(themeId);
  };

  const handleDemoPay = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => window.setTimeout(resolve, 1200));
    unlockPremiumDemo();
    if (lockedThemeId) {
      selectTheme(lockedThemeId);
    }
    setLockedThemeId("");
    setIsProcessing(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="theme-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <div className="theme-modal-header">
          <div>
            <h2>Theme Studio</h2>
            <p>Pick a free theme or unlock premium themes with a demo checkout.</p>
          </div>
          <button className="ghost-button" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="theme-grid">
          {themes.map((themeOption) => {
            const isLocked = themeOption.premium && !hasPremium;
            const isActive = currentTheme.id === themeOption.id;

            return (
              <button
                key={themeOption.id}
                className={`theme-card ${isActive ? "active" : ""} ${isLocked ? "locked" : ""}`}
                onClick={() => handleThemeSelect(themeOption.id, themeOption.premium)}
                type="button"
              >
                <div className="theme-swatch-row">
                  <span style={{ background: themeOption.colors.bg }} />
                  <span style={{ background: themeOption.colors.panel }} />
                  <span style={{ background: themeOption.colors.accent }} />
                </div>
                <strong>{themeOption.name}</strong>
                <small>{themeOption.premium ? (hasPremium ? "Premium unlocked" : "Premium") : "Free"}</small>
              </button>
            );
          })}
        </div>

        <div className="premium-banner">
          <strong>{hasPremium ? "Premium active" : "Premium themes locked"}</strong>
          <span>
            {hasPremium
              ? "You can now use all premium themes in this demo build."
              : "Try a fake upgrade flow with UPI, cards, wallets, and other options."}
          </span>
        </div>

        {lockedThemeId ? (
          <div className="payment-card">
            <h3>Demo Premium Checkout</h3>
            <p>This is a fake paywall for demo purposes only. No real money is charged.</p>

            <div className="payment-options">
              {PAYMENT_OPTIONS.map((option) => (
                <button
                  key={option}
                  className={`payment-option ${paymentMethod === option ? "active" : ""}`}
                  onClick={() => setPaymentMethod(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="payment-summary">
              <span>Selected method</span>
              <strong>{paymentMethod}</strong>
            </div>

            <div className="button-row">
              <button className="primary-button" disabled={isProcessing} onClick={handleDemoPay} type="button">
                {isProcessing ? "Processing demo payment..." : "Unlock Premium Demo"}
              </button>
              <button className="ghost-button" onClick={() => setLockedThemeId("")} type="button">
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
