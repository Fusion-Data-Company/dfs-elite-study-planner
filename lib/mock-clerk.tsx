import React, { createContext, useContext, useState, ReactNode } from "react";
import { View } from "react-native";

// --- Mock Context ---
const MockAuthContext = createContext({
    isSignedIn: false,
    isLoaded: true,
    userId: null as string | null,
    signOut: async () => { },
    signIn: async () => { }, // Helper for mock
});

// --- Provider ---
export function ClerkProvider({ children }: { children: ReactNode }) {
    const [isSignedIn, setIsSignedIn] = useState(false);

    // Mock sign in/out logic
    const value = {
        isSignedIn,
        isLoaded: true,
        userId: isSignedIn ? "mock_user_123" : null,
        signOut: async () => setIsSignedIn(false),
        signIn: async () => setIsSignedIn(true),
    };

    return (
        <MockAuthContext.Provider value={value}>
            {children}
        </MockAuthContext.Provider>
    );
}

// --- Hooks ---
export function useAuth() {
    return useContext(MockAuthContext);
}

export function useUser() {
    const { isSignedIn } = useAuth();
    if (!isSignedIn) return { user: null, isLoaded: true };

    return {
        isLoaded: true,
        isSignedIn: true,
        user: {
            id: "mock_user_123",
            fullName: "Demo User",
            primaryEmailAddress: { emailAddress: "demo@example.com" },
            firstName: "Demo",
            lastName: "User",
            imageUrl: "https://i.pravatar.cc/300",
        },
    };
}

export function useSignIn() {
    const { signIn } = useAuth();
    return {
        signIn: {
            create: async () => {
                await signIn();
                return { status: "complete" };
            },
        },
        isLoaded: true,
        setActive: () => { },
    };
}

export function useSignUp() {
    const { signIn } = useAuth();
    return {
        signUp: {
            create: async () => {
                await signIn();
                return { status: "complete" };
            },
            prepareEmailAddressVerification: async () => { },
            attemptEmailAddressVerification: async () => {
                return { status: "complete" };
            }
        },
        isLoaded: true,
        setActive: () => { },
    };
}


// --- Components ---
export function ClerkLoaded({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

export function SignedIn({ children }: { children: ReactNode }) {
    const { isSignedIn } = useAuth();
    return isSignedIn ? <>{children}</> : null;
}

export function SignedOut({ children }: { children: ReactNode }) {
    const { isSignedIn } = useAuth();
    return !isSignedIn ? <>{children}</> : null;
}
