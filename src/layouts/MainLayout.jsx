import { Outlet } from "react-router-dom";
import { Header2 } from "./Header2";
import { Header } from "./Header";
import { Footer } from "./Footer";

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header2 />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
