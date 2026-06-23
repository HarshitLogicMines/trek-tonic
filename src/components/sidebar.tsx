import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { listTrips } from "@/lib/trips.functions";
import { toast } from "sonner";
import {
  Compass,
  PanelLeftClose,
  MessageSquare,
  Search,
  Bookmark,
  ChevronRight,
  MoreHorizontal,
  Map,
  Globe,
  Bell,
  Lightbulb,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Auto-collapse sidebar on smaller screens initially
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function Sidebar() {
  const navigate = useNavigate();
  const fetchTrips = useServerFn(listTrips);
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const [recentTrips, setRecentTrips] = useState<any[]>([]);

  const loadRecentTrips = () => {
    fetchTrips()
      .then((data) => {
        if (data) {
          setRecentTrips(data.slice(0, 8)); // Get last 8 saved trips
        }
      })
      .catch((e) => console.error("Failed to load recent trips", e));
  };

  // Fetch recent trips initially
  useEffect(() => {
    loadRecentTrips();
  }, [fetchTrips]);

  // Listen to trip save/update events to refresh the recents list
  useEffect(() => {
    const handleTripUpdated = () => {
      loadRecentTrips();
    };
    window.addEventListener("trip-updated", handleTripUpdated);
    window.addEventListener("new-chat", handleTripUpdated);
    return () => {
      window.removeEventListener("trip-updated", handleTripUpdated);
      window.removeEventListener("new-chat", handleTripUpdated);
    };
  }, [fetchTrips]);

  const handleNewChat = () => {
    if (window.location.pathname === "/plan") {
      window.dispatchEvent(new Event("new-chat"));
    } else {
      navigate({ to: "/plan" }).then(() => {
        // Dispatch after a short delay to allow component mounting
        setTimeout(() => {
          window.dispatchEvent(new Event("new-chat"));
        }, 100);
      });
    }
  };

  return (
    <div
      className={`relative flex h-full flex-col bg-[#0d0d0d] text-zinc-200 transition-all duration-300 ease-in-out border-r border-zinc-800 shrink-0 ${sidebarOpen ? "w-64" : "w-0 overflow-hidden border-r-0"
        }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-4 shrink-0">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-white hover:opacity-90">
          <span className="grid h-7 w-7 place-items-center rounded-lg gradient-amber text-navy shadow-soft">
            <Compass className="h-4 w-4" strokeWidth={2.5} />
          </span>
          TripMind
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition"
          title="Collapse sidebar"
        >
          <PanelLeftClose className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col gap-1 px-2.5 py-2 shrink-0">
        <button
          onClick={handleNewChat}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition font-medium text-left"
        >
          <MessageSquare className="h-4 w-4" />
          <span>New chat</span>
        </button>

        <button
          onClick={() => toast.info("Search feature coming soon!")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition font-medium text-left"
        >
          <Search className="h-4 w-4" />
          <span>Search chats</span>
        </button>

        <button
          onClick={() => toast.info("Explore curated travel guides coming soon!")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition font-medium text-left"
        >
          <Globe className="h-4 w-4" />
          <span>Explore</span>
        </button>

        <button
          onClick={() => navigate({ to: "/saved" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition font-medium text-left"
        >
          <Bookmark className="h-4 w-4" />
          <span>Saved</span>
        </button>

        <button
          onClick={() => toast.info("Updates workspace coming soon!")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition font-medium text-left"
        >
          <Bell className="h-4 w-4" />
          <span>Updates</span>
        </button>

        <button
          onClick={() => toast.info("Travel inspiration and ideas coming soon!")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition font-medium text-left"
        >
          <Lightbulb className="h-4 w-4" />
          <span>Inspiration</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition font-medium text-left">
              <MoreHorizontal className="h-4 w-4" />
              <span>More</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-[#18181b] border border-zinc-800 text-zinc-200">
            <DropdownMenuItem onClick={() => toast.info("Settings panel is under construction.")} className="text-xs hover:bg-zinc-800 cursor-pointer">
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Clear all histories is disabled.")} className="text-xs hover:bg-zinc-800 text-destructive cursor-pointer">
              Clear History
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Recents List */}
      <div className="flex-1 overflow-y-auto mt-4 px-3">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 hover:text-zinc-300 cursor-pointer select-none">
          <span>Recents</span>
          <ChevronRight className="h-3 w-3" />
        </div>
        <div className="mt-2 space-y-0.5">
          {recentTrips.length === 0 ? (
            <span className="block px-3 py-2 text-xs text-zinc-600">No saved plans yet</span>
          ) : (
            recentTrips.map((trip) => (
              <button
                key={trip.id}
                onClick={() => navigate({ to: "/itinerary/$id", params: { id: trip.id } })}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-800/60 hover:text-white text-left truncate transition"
                title={trip.title}
              >
                <Bookmark className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                <span className="truncate">{trip.title}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Footer Profile Section */}
      <div className="mt-auto border-t border-zinc-800 bg-[#090909] p-3 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-600 text-white font-bold text-sm">
            HC
          </div>
          <div className="flex flex-col overflow-hidden text-left">
            <span className="text-sm font-medium text-white truncate">Harshit Chaturvedi</span>
            <span className="text-xs text-zinc-500">Free</span>
          </div>
        </div>
        <button
          onClick={() => toast.success("Subscribed to TripMind Premium!")}
          className="rounded-full bg-zinc-800 hover:bg-zinc-700 px-3 py-1 text-xs font-medium text-white transition shrink-0"
        >
          Upgrade
        </button>
      </div>
    </div>
  );
}
