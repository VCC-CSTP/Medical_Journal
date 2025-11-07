import { Routes, Route } from "react-router-dom";
import "./App.css";
import { MainLayout } from "./layouts/MainLayout";
import { AdminLayout } from "./layouts/AdminLayout";

// Importing FrontEnd pages
import { HomePage } from "./pages/public/HomePage";
import { AboutPage } from "./pages/public/AboutPage";
import { PamjePage } from "./pages/public/PamjePage";
import { JournalsPage } from "./pages/public/journals/JournalsPage";
import { JournalDetailPage } from "./pages/public/journals/JournalDetailPage";
import { BrowseJournalsPage } from "./pages/public/journals/BrowseJournalsPage";
import { FeaturedJournalsPage } from "./pages/public/journals/FeaturedJournalsPage";
import { CategoryJournalsPage } from "./pages/public/journals/CategoryJournalsPage";
import { EditorsResourcesPage } from "./pages/public/resources/EditorsResourcesPage";
import { ResearchersResourcesPage } from "./pages/public/resources/ResearchersResourcesPage";
import { GuidelinesPage } from "./pages/public/GuidelinesPage";
import { FAQPage } from "./pages/public/resources/FAQPage";
import { NewsPage } from "./pages/public/resources/NewsPage";
import { ContactPage } from "./pages/public/ContactPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { SearchPage } from "./pages/public/SearchPage";
import { Sponsors } from "./pages/public/Sponsors";
import { NotFoundPage } from "./pages/NotFoundPage";

// BackEnd pages
import { DashboardPage } from "./pages/admin/DashboardPage";
import { CreateJournalPage } from "./pages/admin/journals/CreateJournalPage";
import { AdminLoginPage } from "./pages/auth/AdminLoginPage";

function App() {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pamje" element={<PamjePage />} />
          <Route path="/journals" element={<JournalsPage />} />
          <Route path="/journals/browse" element={<BrowseJournalsPage />} />
          <Route path="/journals/featured" element={<FeaturedJournalsPage />} />
          <Route path="/journals/category" element={<CategoryJournalsPage />} />
          <Route path="/journaldetail" element={<JournalDetailPage />} />
          <Route path="/resources/editors" element={<EditorsResourcesPage />} />
          <Route
            path="/resources/researchers"
            element={<ResearchersResourcesPage />}
          />
          <Route path="/resources/faq" element={<FAQPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/sponsors" element={<Sponsors />} />

          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/adm/dashboard" element={<DashboardPage />} />
          <Route path="/adm/create/journal" element={<CreateJournalPage />} />
          <Route path="/adm/login" element={<AdminLoginPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
