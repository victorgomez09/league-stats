export default function SearchLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div
            className="flex flex-col p-6 w-full h-full"
        >
            {children}
        </div>
    );
}
