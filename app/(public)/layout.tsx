import { Navigation } from "@/components/Shared/Navigation";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2024 Colorado Job Board. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="/privacy" className="hover:text-foreground">
              Privacy
            </a>
            <a href="/terms" className="hover:text-foreground">
              Terms
            </a>
            <a href="/contact" className="hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}