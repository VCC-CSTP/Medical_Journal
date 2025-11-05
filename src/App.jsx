import { Routes, Route } from "react-router-dom";
import "./App.css";
import { MainLayout } from "./pages/MainLayout";

// Importing FrontEnd pages
import { HomePage } from "./frontend/HomePage";
import { AboutPage } from "./frontend/AboutPage";
import { PamjePage } from "./frontend/PamjePage";
import { JournalsPage } from "./frontend/JournalsPage";
import { JournalDetailPage } from "./frontend/JournalDetailPage";
import { BrowseJournalsPage } from "./frontend/BrowseJournalsPage";
import { FeaturedJournalsPage } from "./frontend/FeaturedJournalsPage";
import { CategoryJournalsPage } from "./frontend/CategoryJournalsPage";
import { EditorsResourcesPage } from "./frontend/EditorsResourcesPage";
import { ResearchersResourcesPage } from "./frontend/ResearchersResourcesPage";
import { GuidelinesPage } from "./frontend/GuidelinesPage";
import { TemplatesPage } from "./frontend/TemplatesPage";
import { FAQPage } from "./frontend/FAQPage";
import { NewsPage } from "./frontend/NewsPage";
import { ContactPage } from "./frontend/ContactPage";
import { LoginPage } from "./frontend/LoginPage";
import { RegisterPage } from "./frontend/RegisterPage";
import { SearchPage } from "./frontend/SearchPage";
import { NotFoundPage } from "./frontend/NotFoundPage";


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
          <Route path="resources/editors" element={<EditorsResourcesPage />} />
          <Route
            path="resources/researchers"
            element={<ResearchersResourcesPage />}
          />
          <Route path="resources/templates" element={<TemplatesPage />} />
          <Route path="resources/faq" element={<FAQPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchPage />} />

          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
