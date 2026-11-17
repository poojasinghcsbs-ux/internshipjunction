import { Link } from "react-router-dom";
import { Home, Compass, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <p className="gradient-text text-7xl font-black">404</p>
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you're looking for doesn't exist or may have been moved. Let's get you back on track.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button asChild><Link to="/"><Home className="size-4" /> Go home</Link></Button>
          <Button variant="outline" asChild><Link to="/courses"><Compass className="size-4" /> Browse courses</Link></Button>
          <Button variant="ghost" asChild><Link to="/contact"><LifeBuoy className="size-4" /> Get help</Link></Button>
        </div>
      </div>
    </section>
  );
}
