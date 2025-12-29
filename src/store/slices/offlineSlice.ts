import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type OfflineState = {
    isOnline: boolean;
    queueSize: number;
    lastSyncAt: number | null;
};

const initialState: OfflineState = {
    isOnline: true,
    queueSize: 0,
    lastSyncAt: null,
};

const offlineSlice = createSlice({
    name: 'offline',
    initialState,
    reducers: {
        setOnline(state, action: PayloadAction<boolean>) {
            state.isOnline = action.payload;
        },
        setQueueSize(state, action: PayloadAction<number>) {
            state.queueSize = action.payload;
        },
        setLastSyncAt(state, action: PayloadAction<number | null>) {
            state.lastSyncAt = action.payload;
        },
    },
});

export const { setOnline, setQueueSize, setLastSyncAt } = offlineSlice.actions;
export default offlineSlice.reducer;

