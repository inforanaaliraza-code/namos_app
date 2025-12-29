/**
 * Batch Utility
 * Batches multiple Redux dispatches to reduce re-renders
 */

type BatchedAction = () => void;

class BatchManager {
    private queue: BatchedAction[] = [];
    private timeout: ReturnType<typeof setTimeout> | null = null;
    private readonly BATCH_DELAY = 16; // ~60fps (one frame)

    /**
     * Add an action to the batch queue
     */
    add(action: BatchedAction) {
        this.queue.push(action);
        
        if (!this.timeout) {
            this.timeout = setTimeout(() => {
                this.flush();
            }, this.BATCH_DELAY);
        }
    }

    /**
     * Immediately flush all queued actions
     */
    flush() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }

        if (this.queue.length === 0) return;

        const actions = [...this.queue];
        this.queue = [];

        // Execute all actions in a single batch
        // React will batch these updates automatically
        actions.forEach(action => action());
    }

    /**
     * Clear all pending actions without executing them
     */
    clear() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.queue = [];
    }
}

export const batchManager = new BatchManager();

/**
 * Batch a Redux dispatch or any action
 * Actions will be executed in ~16ms batches to reduce re-renders
 */
export const batchDispatch = (action: BatchedAction) => {
    batchManager.add(action);
};

/**
 * Force flush all pending batched actions immediately
 */
export const flushBatch = () => {
    batchManager.flush();
};

