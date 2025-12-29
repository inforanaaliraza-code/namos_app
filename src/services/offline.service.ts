/**
 * Offline Manager
 * - Tracks connectivity
 * - Caches GET responses
 * - Queues mutating requests for later replay
 */

import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

type CachedResponse = {
    data: any;
    status: number;
    headers?: Record<string, any>;
    cachedAt: number;
};

export type QueuedRequest = {
    id: string;
    method: string;
    url?: string;
    data?: any;
    params?: any;
    headers?: Record<string, any>;
    queuedAt: number;
};

type StatusListener = (online: boolean) => void;

const CACHE_PREFIX = '@offline_cache:';
const QUEUE_KEY = '@offline_queue';

class OfflineManager {
    private online = true;
    private initialized = false;
    private listeners: StatusListener[] = [];

    async init() {
        if (this.initialized) return;
        this.initialized = true;

        const state = await NetInfo.fetch();
        this.online = !!state.isConnected;

        NetInfo.addEventListener((status) => {
            this.online = !!status.isConnected;
            this.listeners.forEach((cb) => cb(this.online));
        });
    }

    isOnline() {
        return this.online;
    }

    onStatusChange(cb: StatusListener) {
        this.listeners.push(cb);
        return () => {
            this.listeners = this.listeners.filter((fn) => fn !== cb);
        };
    }

    // ----- Cache helpers -----
    private buildCacheKey(config: InternalAxiosRequestConfig) {
        const method = (config.method || 'get').toLowerCase();
        const url = config.url || '';
        // Only cache GETs
        if (method !== 'get') return `${CACHE_PREFIX}skip:${method}:${url}`;
        const params = config.params ? JSON.stringify(config.params) : '';
        return `${CACHE_PREFIX}${method}:${url}?${params}`;
    }

    async cacheResponse(config: InternalAxiosRequestConfig, response: AxiosResponse) {
        const key = this.buildCacheKey(config);
        if (!key.startsWith(CACHE_PREFIX)) return;

        const payload: CachedResponse = {
            data: response.data,
            status: response.status,
            headers: response.headers as Record<string, any>,
            cachedAt: Date.now(),
        };

        try {
            await AsyncStorage.setItem(key, JSON.stringify(payload));
        } catch (err) {
            console.warn('[Offline] Failed to cache response', err);
        }
    }

    async getCachedResponse(config: InternalAxiosRequestConfig): Promise<AxiosResponse | null> {
        const key = this.buildCacheKey(config);
        if (!key.startsWith(CACHE_PREFIX)) return null;

        try {
            const raw = await AsyncStorage.getItem(key);
            if (!raw) return null;

            const cached: CachedResponse = JSON.parse(raw);
            const response: AxiosResponse = {
                data: cached.data,
                status: cached.status,
                statusText: 'OK',
                headers: cached.headers || {},
                config,
                request: null,
            };
            return response;
        } catch (err) {
            console.warn('[Offline] Failed to read cache', err);
            return null;
        }
    }

    // ----- Queue helpers -----
    private async readQueue(): Promise<QueuedRequest[]> {
        try {
            const raw = await AsyncStorage.getItem(QUEUE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (err) {
            console.warn('[Offline] Failed to read queue', err);
            return [];
        }
    }

    private async writeQueue(queue: QueuedRequest[]) {
        try {
            await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
        } catch (err) {
            console.warn('[Offline] Failed to persist queue', err);
        }
    }

    async getQueueLength(): Promise<number> {
        const queue = await this.readQueue();
        return queue.length;
    }

    async enqueueRequest(config: InternalAxiosRequestConfig): Promise<QueuedRequest> {
        const queue = await this.readQueue();
        const entry: QueuedRequest = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            method: (config.method || 'get').toLowerCase(),
            url: config.url,
            data: config.data,
            params: config.params,
            headers: config.headers ? JSON.parse(JSON.stringify(config.headers)) : undefined,
            queuedAt: Date.now(),
        };

        queue.push(entry);
        await this.writeQueue(queue);
        return entry;
    }

    async flushQueue(
        executor: (request: QueuedRequest) => Promise<void>
    ): Promise<{ processed: number; failed: number }> {
        const queue = await this.readQueue();
        if (!queue.length) return { processed: 0, failed: 0 };

        const remaining: QueuedRequest[] = [];

        for (const item of queue) {
            try {
                await executor(item);
            } catch (err) {
                console.warn('[Offline] Failed to replay request', item.url, err);
                remaining.push(item);
            }
        }

        await this.writeQueue(remaining);
        return { processed: queue.length - remaining.length, failed: remaining.length };
    }
}

export const offlineManager = new OfflineManager();

