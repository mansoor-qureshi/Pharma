import "./css/app-style.css"; // Import CSS file
import "./App.css";
import React, { Suspense, lazy, useEffect } from "react";
import {
  Route,
  Routes,
  useLocation,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";
import TopBar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import PageNotFound from "./pages/PageNotFound";
import UnAuthorizedPage from "./pages/UnAuthorizedPage";
import { useAuth } from "./context/AuthContext";
import { useRouteMatch } from "./context/RouteMatchContext";
import Spinner from "./custom/Spinner";
import RoleNotImplemented from "./pages/RoleNotImplemented";
import { roles } from "./utils/Roles";

const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const PatientPage = lazy(() => import("./pages/PatientManagement"));
const AdminPage = lazy(() => import("./pages/Admin"));
const Campaign = lazy(() => import("./components/campaign/Campaign"));
const CampaignHistory = lazy(() =>
  import("./components/campaign/CampaignHistory")
);
const PatientDetailsComponent = lazy(() =>
  import("./components/doctor_components/PatientDetialsModel")
);
const DepartmentList = lazy(() => import("./components/Department"));
const QualificationList = lazy(() =>
  import("./components/QualificationComponent")
);
const BuyPage = lazy(() => import("./components/pharmacy_components/BuyPage"));
const BasketPage = lazy(() =>
  import("./components/pharmacy_components/BasketPage")
);
const User = lazy(() => import("./components/user/User"));
const InventoryList = lazy(() => import("./pages/Inventory"));
const MedicineCategory = lazy(() => import("./pages/MedicineCategory"));
const DoctorPatients = lazy(() =>
  import("./components/doctor_components/DoctorPatients")
);
const Details = lazy(() => import("./components/inventory/details/Details"));
const Report = lazy(() => import("./components/reports/Report"));
const PharmaPatients = lazy(() =>
  import("./components/pharmacy_components/PharmaPatients")
);

const routes = [
  {
    path: "/user",
    element: <User />,
    roles: ["admin", "doctor"],
  },
  {
    path: "/details",
    element: <Details />,
    // roles: []
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    roles: ["admin", "doctor"],
  },
  {
    path: "/patients",
    element: <PatientPage />,
    roles: ["admin"],
  },
  {
    path: "/admin",
    element: <AdminPage />,
    roles: ["admin"],
  },
  {
    path: "/admin/campaign",
    element: <Campaign />,
    roles: ["admin"],
  },
  {
    path: "/admin/campaign/campaign-history/:id",
    element: <CampaignHistory />,
    roles: ["admin"],
  },
  {
    path: "/reports",
    element: <Report />,
    roles: ["admin"],
  },
  {
    path: "/doctor",
    element: <DoctorPatients />,
    roles: ["doctor"],
  },
  {
    path: "/pharmacist",
    element: <PharmaPatients />,
    roles: ["pharmacist"],
  },
  {
    path: "/buy-page/:id",
    element: <BuyPage />,
    roles: ["pharmacist"],
  },
  {
    path: "/basket-page",
    element: <BasketPage />,
    roles: ["pharmacist"],
  },
  {
    path: "/department",
    element: <DepartmentList />,
    roles: ["admin"],
  },
  {
    path: "/qualification",
    element: <QualificationList />,
    roles: ["admin"],
  },
  {
    path: "/inventory",
    element: <InventoryList />,
    // roles:['admin']
  },
  {
    path: "/medicinecategory",
    element: <MedicineCategory />,
    roles: ["admin"],
  },
  {
    path: "/patient-history/:id",
    element: <PatientDetailsComponent />,
    roles: ["admin", "doctor", "pharmacist"],
  },
];

const PublicRoute = () => {
  const { loginInfo } = useAuth();

  const isLoggedIn = loginInfo?.isLoggedIn;
  const loggedInUserRole = loginInfo?.user?.role;

  const dashboardRoles = ["admin", "doctor"];

  if (isLoggedIn) {
    if (dashboardRoles.includes(loggedInUserRole)) {
      return <Navigate to="/dashboard" />;
    }
    if (loggedInUserRole === "pharmacist") {
      return <Navigate to="/pharmacist" />;
    }
    return <Navigate to="/roleNotImplemented" />;
  }

  return <Outlet />;
};

const ProtectedRoute = ({ roles }) => {
  const { loginInfo } = useAuth();
  const isLoggedIn = loginInfo?.isLoggedIn;
  const loggedInUserRole = loginInfo?.user?.role;
  const location = useLocation();

  // return (
  //   isLoggedIn ? <Outlet /> : <Navigate to='/' />
  // )

  if (!isLoggedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(loggedInUserRole)) {
    return <Navigate to="/unauthorized" state={{ from: location }} />;
  }

  return <Outlet />;
};

const NoRouteMatched = () => {
  const { loginInfo } = useAuth();
  const { setIsRouteMatched } = useRouteMatch();
  const isLoggedIn = loginInfo?.isLoggedIn;

  // if (!isLoggedIn) {
  //   return <Navigate to="/" />;
  // }
  // debugger
  setIsRouteMatched(false);
  return <Outlet />;
};

function App() {
  const { loginInfo } = useAuth();
  const { isRouteMatched } = useRouteMatch();
  const location = useLocation();

  const isUnAuthorizedPage = location.pathname == "/unauthorized";

  return (
    <div>
      {loginInfo?.isLoggedIn && isRouteMatched && !isUnAuthorizedPage && (
        <TopBar className="top-bar" />
      )}
      <div className="main-container">
        {loginInfo?.isLoggedIn && isRouteMatched && !isUnAuthorizedPage && (
          <Sidebar className="sidebar" />
        )}
        <div className="content">
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route element={<PublicRoute />}>
                <Route path="/" element={<LoginPage />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                {routes.map((route, index) => (
                  <Route
                    key={index}
                    element={
                      <ProtectedRoute
                        roles={route.roles}
                        key={`${index}-protected`}
                      />
                    }
                  >
                    <Route
                      key={route.path}
                      path={route.path}
                      element={route.element}
                    />
                  </Route>
                ))}
              </Route>

              <Route path="/unauthorized" element={<UnAuthorizedPage />} />
              <Route
                path="/roleNotImplemented"
                element={<RoleNotImplemented />}
              />
              <Route element={<NoRouteMatched />}>
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Route>
              <Route path="/404" element={<PageNotFound />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default App;
