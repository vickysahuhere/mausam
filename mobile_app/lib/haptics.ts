/**
 * Universal tactile and haptic feedback utility.
 * Dynamically resolves native vibration patterns on Android/iOS with Node and Web safety.
 */

function getVibration(): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const rn = require('react-native');
    if (rn && rn.Platform && rn.Platform.OS !== 'web') {
      return rn.Vibration;
    }
    return null;
  } catch {
    return null;
  }
}

class HapticsController {
  private isEnabled: boolean = true;

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Ultra-light selection tick (slider moves, tab switching, option toggles)
   */
  public selection() {
    if (!this.isEnabled) return;
    try {
      const v = getVibration();
      if (v) v.vibrate(8);
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Light impact (button press, card tap)
   */
  public impactLight() {
    if (!this.isEnabled) return;
    try {
      const v = getVibration();
      if (v) v.vibrate(15);
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Medium impact (widget add/remove, modal open)
   */
  public impactMedium() {
    if (!this.isEnabled) return;
    try {
      const v = getVibration();
      if (v) v.vibrate(28);
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Success notification pattern (refresh complete, save complete)
   */
  public notificationSuccess() {
    if (!this.isEnabled) return;
    try {
      const v = getVibration();
      if (v) v.vibrate([0, 20, 60, 25]);
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Warning notification pattern (severe alert, error)
   */
  public notificationWarning() {
    if (!this.isEnabled) return;
    try {
      const v = getVibration();
      if (v) v.vibrate([0, 45, 70, 50]);
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Feline purr rumble simulation — gentle alternating micro-pulses
   */
  public felinePurr() {
    if (!this.isEnabled) return;
    try {
      const v = getVibration();
      if (v) v.vibrate([0, 14, 25, 14, 25, 14]);
    } catch {
      // Graceful fallback
    }
  }
}

export const haptics = new HapticsController();
