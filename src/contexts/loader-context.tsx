'use client'
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface LoaderContextProps {
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
}

const LoaderContext = createContext<LoaderContextProps | undefined>(undefined);

export const LoaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoading, setLoading] = useState<boolean>(false);

    return (
        <LoaderContext.Provider value={{ isLoading, setLoading }}>
            {children}
        </LoaderContext.Provider>
    );
};

export const useLoader = (): LoaderContextProps => {
    const context = useContext(LoaderContext);
    if (context === undefined) {
        throw new Error('useLoader must be used within a LoaderProvider');
    }
    return context;
};