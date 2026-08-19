type PollCallback<T> = (data: T) => void;
type PollErrorHandler = (error: Error) => void;

interface PollConfig {
  interval: number;
  slowInterval: number;
  onError?: PollErrorHandler;
}

interface PollEntry {
  intervalId: ReturnType<typeof setInterval>;
  fetchFn: () => Promise<unknown>;
  callback: PollCallback<unknown>;
  config: PollConfig;
  inFlight: boolean;
}

class LivePollingService {
  private polls: Map<string, PollEntry> = new Map();
  private isPageActive = true;
  private defaultConfig: PollConfig = {
    interval: 5000, // 5 seconds
    slowInterval: 30000, // 30 seconds when page is inactive
  };

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', this.handleFocus);
      window.addEventListener('blur', this.handleBlur);
    }
  }

  private handleVisibilityChange = () => {
    if (typeof document === 'undefined') return;
    this.isPageActive = document.visibilityState === 'visible';
    this.restartAllPolls();
  };

  private handleFocus = () => {
    this.isPageActive = true;
    this.restartAllPolls();
  };

  private handleBlur = () => {
    this.isPageActive = false;
    this.restartAllPolls();
  };

  private currentInterval(entry: PollEntry): number {
    return this.isPageActive ? entry.config.interval : entry.config.slowInterval;
  }

  private restartAllPolls() {
    this.polls.forEach((entry, key) => {
      clearInterval(entry.intervalId);
      const next = this.schedule(entry);
      this.polls.set(key, { ...entry, intervalId: next });
    });
  }

  private schedule(entry: PollEntry): ReturnType<typeof setInterval> {
    return setInterval(() => this.executePoll(entry), this.currentInterval(entry));
  }

  start<T>(
    key: string,
    fetchFn: () => Promise<T>,
    callback: PollCallback<T>,
    config?: Partial<PollConfig>,
  ) {
    this.stop(key);
    const entry: PollEntry = {
      intervalId: 0 as unknown as ReturnType<typeof setInterval>,
      fetchFn: fetchFn as () => Promise<unknown>,
      callback: callback as PollCallback<unknown>,
      config: { ...this.defaultConfig, ...config },
      inFlight: false,
    };
    // Execute immediately
    this.executePoll(entry);
    entry.intervalId = this.schedule(entry);
    this.polls.set(key, entry);
  }

  private async executePoll(entry: PollEntry) {
    // Prevent overlapping requests.
    if (entry.inFlight) return;
    entry.inFlight = true;
    try {
      const data = await entry.fetchFn();
      entry.callback(data);
    } catch (error) {
      if (entry.config.onError && error instanceof Error) {
        entry.config.onError(error);
      } else {
        console.error('Polling error:', error);
      }
    } finally {
      entry.inFlight = false;
    }
  }

  stop(key: string) {
    const entry = this.polls.get(key);
    if (entry) {
      clearInterval(entry.intervalId);
      this.polls.delete(key);
    }
  }

  stopAll() {
    this.polls.forEach((entry) => clearInterval(entry.intervalId));
    this.polls.clear();
  }

  isPolling(key: string): boolean {
    return this.polls.has(key);
  }
}

export const livePolling = new LivePollingService();

// Helper hook wrapper for React components
export function useLivePolling() {
  return {
    startPolling: livePolling.start.bind(livePolling),
    stopPolling: livePolling.stop.bind(livePolling),
    stopAllPolling: livePolling.stopAll.bind(livePolling),
    isPolling: livePolling.isPolling.bind(livePolling),
  };
}
