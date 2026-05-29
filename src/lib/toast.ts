/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastEventDetail {
  message: string;
  type: ToastType;
  duration?: number;
}

export function showToast(message: string, type: ToastType = 'success', duration = 3000) {
  const event = new CustomEvent('mimoo-toast', {
    detail: { message, type, duration }
  });
  window.dispatchEvent(event);
}
