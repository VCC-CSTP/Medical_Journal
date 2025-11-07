import { Outlet } from "react-router-dom";
import { Header2 } from "../components/Header2";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Footer2 } from "../components/Footer2";

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
