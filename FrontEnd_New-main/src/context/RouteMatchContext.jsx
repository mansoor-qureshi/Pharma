import React, { createContext, useState, useContext, useEffect } from 'react';

const RouteMatchContext = createContext();

export const RouteMatchProvider = ({ children }) => {
    const [isRouteMatched, setIsRouteMatched] = useState(true)

    return (
        <RouteMatchContext.Provider value={{ isRouteMatched, setIsRouteMatched }}>
            {children}
        </RouteMatchContext.Provider>
    );
};

export const useRouteMatch = () => {
    const context = useContext(RouteMatchContext);
    if (!context) {
        throw new Error('RouteMatchContext must be used within a RouteMatchProvider');
    }

    return context
};
