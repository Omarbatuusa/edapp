'use client';

import { createContext, useContext } from 'react';

export interface ShellActions {
    openEmergency: () => void;
    openReportsHub: () => void;
    openSearch: () => void;
}

const ShellActionsContext = createContext<ShellActions>({
    openEmergency: () => {},
    openReportsHub: () => {},
    openSearch: () => {},
});

export const ShellActionsProvider = ShellActionsContext.Provider;
export const useShellActions = () => useContext(ShellActionsContext);
