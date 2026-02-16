import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Al-Ayyam AI Platform - Authentication",
    description: "Sign in or create an account to access the Al-Ayyam AI news management platform.",
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
