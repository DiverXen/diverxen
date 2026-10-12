import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Hero />
      <section className="flex h-screen items-center justify-center">
        Homepage
      </section>
    </main>
  );
}
