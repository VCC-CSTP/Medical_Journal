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
// import { CategoryJournalsPage } from "./pages/public/journals/CategoryJournalsPage";
import { EditorsResourcesPage } from "./pages/public/resources/EditorsResourcesPage";
import { ResearchersResourcesPage } from "./pages/public/resources/ResearchersResourcesPage";
import { GuidelinesPage } from "./pages/public/GuidelinesPage";
import { FAQPage } from "./pages/public/resources/FAQPage";
import { NewsPage } from "./pages/public/resources/NewsPage";
import { ContactPage } from "./pages/public/ContactPage";
import { SearchPage } from "./pages/public/SearchPage";
import { Sponsors } from "./pages/public/Sponsors";
import { NotFoundPage } from "./pages/NotFoundPage";

//Authenticated sites
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { PeoplePage } from "./pages/authenticated/PeoplePage";
import { ProtectedRoute } from "./pages/auth/ProtectedRoute";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";
import { LogOut } from "./pages/auth/LogOut";

// Admin pages
import { DashboardPage } from "./pages/admin/DashboardPage";
import { CreateJournalPage } from "./pages/admin/journals/CreateJournalPage";
import { CreateOrganization } from "./pages/admin/organizations/CreateOrganization";
import { CreatePerson } from "./pages/admin/people/CreatePerson";
import { CreateIndexPage } from "./pages/admin/indexing/CreateIndexPage";
import { AssignJournal } from "./pages/admin/people/AssignJournal";
import { ManageAssignments } from "./pages/admin/people/ManageAssignment";
import { PendingApprovals } from "./pages/admin/people/PendingApprovals";

// Admin Listings
import { ListIndex } from "./pages/admin/indexing/ListIndex";
import { ListPeople } from "./pages/admin/people/ListPeople";
import { ListOrganizations } from "./pages/admin/organizations/ListOrganizations";
import { ListJournals } from "./pages/admin/journals/ListJournals";

// Admin Edits
import { EditIndexPage } from "./pages/admin/indexing/EditIndexPage";
import { EditJournalPage} from "./pages/admin/journals/EditJournalPage";
import { EditOrganization } from "./pages/admin/organizations/EditOrganization";
import { EditPerson } from "./pages/admin/people/EditPerson";
import { AccountEdit } from "./pages/authenticated/AccountEdit";


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
          <Route path="/journals/:id" element={<JournalDetailPage />} />
          {/* <Route path="/journals/category/:category" element={<CategoryJournalsPage />} /> */}
          

          {/* Resources */}
          <Route path="/resources/editors" element={<EditorsResourcesPage />} />
          <Route path="/resources/researchers" element={<ResearchersResourcesPage />} />
          <Route path="/resources/faq" element={<FAQPage />} />
          <Route path="/news" element={<NewsPage />} />

          {/* Auth Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/logout" element={<LogOut />} />

          {/* Authenticated Routes - TODO: Add ProtectedRoute wrapper */}
          <Route path="/peer-reviewers" element={<PeoplePage />} />
          <Route path="/user-account" element={<AccountEdit />} />
        </Route>

        {/* Admin Site  Protected Route*/}
        <Route
          path="/adm/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Journals Management */}
          <Route path="journals/create" element={<CreateJournalPage />} />
          <Route path="journals" element={<ListJournals />} />
          <Route path="journals/:id/edit" element={<EditJournalPage />} />

          {/* Organizations Management */}
          <Route path="organizations/create" element={<CreateOrganization />} />
          <Route path="organizations" element={<ListOrganizations />} />
          <Route path="organizations/:id/edit" element={<EditOrganization />} />

          {/* People Management */}
          <Route path="people/create" element={<CreatePerson />} />
          <Route path="people" element={<ListPeople />} />
          <Route path="people/:id/edit" element={<EditPerson />} />
          <Route path="people/:id/assign-journal" element={<AssignJournal />}/>
          <Route path="people/assignments" element={<ManageAssignments />} />
          <Route path="people/pending-approvals" element={<PendingApprovals/>} />

          {/* Announcements Management */}
          {/* TODO: Add announcement routes
          <Route path="announcements/create" element={<CreateNewsAnnouncementPage />} />
          <Route path="announcements" element={<AdminAnnouncementsListPage />} />
          <Route path="announcements/:id/edit" element={<EditNewsAnnouncementPage />} />
          */}

          {/* Indexing Services Management */}
          <Route path="indexing" element={<ListIndex />} />
          <Route path="indexing/create" element={<CreateIndexPage />} />
          <Route path="indexing/:id/edit" element={<EditIndexPage />} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
