/**
 * Universal tactile and haptic feedback utility for Web.
 * Uses navigator.vibrate when available.
 */

class HapticsController {
  private isEnabled: boolean = true;

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  private vibrate(pattern: number | number[]) {
    if (!this.isEnabled) return;
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Fallback for browsers that block vibration without user gesture
      }
    }
  }

  /**
   * Ultra-light selection tick (slider moves, tab switching, option toggles)
   */
  public selection() {
    this.vibrate(8);
  }

  /**
   * Light impact (button press, card tap)
   */
  public impactLight() {
    this.vibrate(15);
  }

  /**
   * Medium impact (widget add/remove, modal open)
   */
  public impactMedium() {
    this.vibrate(28);
  }

  /**
   * Success notification pattern (refresh complete, save complete)
   */
  public notificationSuccess() {
    this.vibrate([20, 60, 25]);
  }

  /**
   * Warning notification pattern (severe alert, error)
   */
  public notificationWarning() {
    this.vibrate([45, 70, 50]);
  }

  /**
   * Feline purr rumble simulation — gentle alternating micro-pulses
   */
  public felinePurr() {
    this.vibrate([14, 25, 14, 25, 14]);
  }
}

export const haptics = new HapticsController();
