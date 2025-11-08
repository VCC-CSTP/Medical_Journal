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

//Authenticated sites
import { PeoplePage } from "./pages/authenticated/PeoplePage";

// Admin pages
import { DashboardPage } from "./pages/admin/DashboardPage";
import { CreateJournalPage } from "./pages/admin/journals/CreateJournalPage";
import { CreateOrganization } from "./pages/admin/organizations/CreateOrganization";
import { CreatePerson } from "./pages/admin/people/CreatePerson";

function App() {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Homepage */}
          <Route path="/" element={<HomePage />} />

          {/* Information Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pamje" element={<PamjePage />} />
          <Route path="/guidelines" element={<GuidelinesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/sponsors" element={<Sponsors />} />

          {/* Journals */}
          <Route path="/journals" element={<JournalsPage />} />
          <Route path="/journals/browse" element={<BrowseJournalsPage />} />
          <Route path="/journals/featured" element={<FeaturedJournalsPage />} />
          <Route
            path="/journals/category/:category"
            element={<CategoryJournalsPage />}
          />
          <Route path="/journals/:id" element={<JournalDetailPage />} />

          {/* Resources */}
          <Route path="/resources/editors" element={<EditorsResourcesPage />} />
          <Route
            path="/resources/researchers"
            element={<ResearchersResourcesPage />}
          />
          <Route path="/resources/faq" element={<FAQPage />} />
          <Route path="/news" element={<NewsPage />} />

          {/* Auth Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Routes - TODO: Add ProtectedRoute wrapper */}
          <Route path="/people" element={<PeoplePage />} />
        </Route>

        {/* Admin Site */}
        <Route path="/adm" element={<AdminLayout />}>
          {/* Dashboard */}
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Journals Management */}
          <Route path="journals/create" element={<CreateJournalPage />} />
          {/* TODO: Add these routes after creating the pages
          <Route path="journals" element={<AdminJournalsListPage />} />
          <Route path="journals/:id/edit" element={<EditJournalPage />} />
          */}

          {/* Organizations Management */}
          <Route path="organizations/create" element={<CreateOrganization />} />
          {/* TODO: Add these routes after creating the pages
          <Route path="organizations" element={<AdminOrganizationsListPage />} />
          <Route path="organizations/:id/edit" element={<EditOrganization />} />
          */}

          {/* People Management */}
          <Route path="people/create" element={<CreatePerson />} />
          {/* TODO: Add these routes after creating the pages
          <Route path="people" element={<AdminPeopleListPage />} />
          <Route path="people/:id/edit" element={<EditPerson />} />
          */}

          {/* Announcements Management */}
          {/* TODO: Add announcement routes
          <Route path="announcements/create" element={<CreateNewsAnnouncementPage />} />
          <Route path="announcements" element={<AdminAnnouncementsListPage />} />
          <Route path="announcements/:id/edit" element={<EditNewsAnnouncementPage />} />
          */}

          {/* Indexing Services Management */}
          {/* TODO: Add indexing routes
          <Route path="indexing/create" element={<CreateIndexPage />} />
          <Route path="indexing" element={<AdminIndexingListPage />} />
          <Route path="indexing/:id/edit" element={<EditIndexPage />} />
          */}
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
