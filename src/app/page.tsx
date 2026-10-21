import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <header className="px-6 lg:px-8 h-16 flex items-center justify-between border-b border-outline/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-on-primary font-bold">C</span>
          </div>
          <span className="font-semibold text-on-surface">Context Broker</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-on-surface hover:text-primary transition-colors">
            Sign in
          </Link>
          <Link href="/signup">
            <Button>Get Started</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="w-full py-24 md:py-32 lg:py-48 flex items-center justify-center">
          <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8">
            <div className="space-y-4 max-w-[800px]">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-on-surface">
                Unified incident intelligence for engineering teams
              </h1>
              <p className="mx-auto max-w-[600px] text-on-surface-variant md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Bring context to the chaos. Instantly connect Slack conversations, Jira issues, and system alerts into one intelligent workspace.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="px-8 h-12">Start for free</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="px-8 h-12">Sign in to workspace</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-24 bg-surface border-t border-outline/10 flex items-center justify-center">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-on-surface">Incident Aggregation</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Automatically consolidate context from Jira and Slack so engineers never have to piece together timelines manually.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-on-surface">Risk Scoring</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Identify critical and stale incidents before they breach SLAs using intelligent risk and severity distributions.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-on-surface">Multi-tenant Security</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Enterprise-grade role-based access control and strict tenant isolation ensures your workspace data remains yours.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-outline/10 flex flex-col sm:flex-row justify-between">
        <p className="text-xs text-on-surface-variant">
          © 2026 Context Broker. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6 mt-4 sm:mt-0">
          <Link className="text-xs text-on-surface-variant hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs text-on-surface-variant hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
