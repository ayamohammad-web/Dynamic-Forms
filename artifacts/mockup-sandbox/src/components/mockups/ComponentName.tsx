export default function ComponentName() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-12">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Component Preview
          </p>
          <h1 className="text-4xl font-semibold tracking-normal text-foreground">
            ComponentName
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            This preview file is loaded from{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-foreground">
              src/components/mockups/ComponentName.tsx
            </code>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
