import { useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { TopHeader } from "./components/TopHeader";
import { Week11Page } from "./pages/Week11Page";
import { Week12Page } from "./pages/Week12Page";
import { Week13Page } from "./pages/Week13Page";
import { Week14Page } from "./pages/Week14Page";
import { Week15Page } from "./pages/Week15Page";

function Shell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState<string | null>(null);
  const { pathname } = useLocation();

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setSidebarOpen(false);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TopHeader onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-6 sm:py-6 md:px-8">
          <div className="mx-auto max-w-5xl min-w-0">
            <Routes>
              <Route path="/" element={<Navigate to="/week/11" replace />} />
              <Route path="/week/11" element={<Week11Page />} />
              <Route path="/week/12" element={<Week12Page />} />
              <Route path="/week/13" element={<Week13Page />} />
              <Route path="/week/14" element={<Week14Page />} />
              <Route path="/week/15" element={<Week15Page />} />
              <Route path="*" element={<Navigate to="/week/11" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
