/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AITutor from './pages/AITutor.jsx';
import Assignments from './pages/Assignments.jsx';
import Chat from './pages/Chat.jsx';
import CompleteRegistration from './pages/CompleteRegistration.jsx';
import ContentMarketplace from './pages/ContentMarketplace.jsx';
import ContentModeration from './pages/ContentModeration.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Home from './pages/Home.jsx';
import Notes from './pages/Notes.jsx';
import PastPapers from './pages/PastPapers';
import Performance from './pages/Performance.jsx';
import Pricing from './pages/Pricing.jsx';
import Profile from './pages/Profile.jsx';
import Register from './pages/Register.jsx';
import SchoolPartnerships from './pages/SchoolPartnerships.jsx';
import SchoolRegister from './pages/SchoolRegister.jsx';
import Settings from './pages/Settings.jsx';
import ShareContent from './pages/ShareContent.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import Tutors from './pages/Tutors.jsx';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AITutor": AITutor,
    "Assignments": Assignments,
    "Chat": Chat,
    "CompleteRegistration": CompleteRegistration,
    "ContentMarketplace": ContentMarketplace,
    "ContentModeration": ContentModeration,
    "Dashboard": Dashboard,
    "Home": Home,
    "Notes": Notes,
    "PastPapers": PastPapers,
    "Performance": Performance,
    "Pricing": Pricing,
    "Profile": Profile,
    "Register": Register,
    "SchoolPartnerships": SchoolPartnerships,
    "SchoolRegister": SchoolRegister,
    "Settings": Settings,
    "ShareContent": ShareContent,
    "TeacherDashboard": TeacherDashboard,
    "Tutors": Tutors,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};