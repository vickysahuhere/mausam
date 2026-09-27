// A drop-in replacement for React Native's AsyncStorage, backed by Web localStorage
const AsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
  clear: async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  },
};

export default AsyncStorage;
