import React, { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import { styled } from "@mui/material/styles";
import { NavLink, useLocation } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReportIcon from "@mui/icons-material/Report";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CampaignIcon from "@mui/icons-material/Campaign";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import { BusinessRounded, CastForEducationRounded } from "@mui/icons-material";
import InventoryIcon from "@mui/icons-material/Inventory";
import { AiFillMedicineBox } from "react-icons/ai";
import { useAuth } from "../context/AuthContext";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const BlueHighlightListItem = styled(ListItem)(({ theme }) => ({
  "&.Mui-selected": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

const IconWithText = styled("div")({
  display: "flex",
  alignItems: "center",
});

const Text = styled("span")({
  marginLeft: "20px",
});

const SubmenuIcon = styled(ArrowRightIcon)({
  marginLeft: "auto",
});

const SubmenuExpandIcon = styled(ArrowDropDownIcon)({
  marginLeft: "auto",
});

const SubmenuItem = styled(ListItem)(({ theme }) => ({
  paddingLeft: theme.spacing(4), // Adjust indent for submenus
}));

function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [userObj, setUserObj] = useState({});

  const { loginInfo } = useAuth();
  const loggedInUser = loginInfo?.user;

  // useEffect(() => {
  //   const user = JSON.parse(localStorage.getItem('user'));
  //   if (user) {
  //     setUserObj(user);
  //   }
  // }, []);

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  const handleAdminMenuClick = () => {
    setAdminMenuOpen(!adminMenuOpen);
  };

  return (
    <Drawer
      variant="permanent"
      open={isOpen}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        width: isOpen ? 240 : 60,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isOpen ? 240 : 60,
          boxSizing: "border-box",
          top: "68px",
          height: "calc(100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "width 0.3s ease",
        },
      }}
    >
      <Toolbar>
        <DrawerHeader />
      </Toolbar>
      {loggedInUser.role == "admin" && (
        <List sx={{ flexGrow: 1, marginTop: 0 }}>
          <NavLink
            to="/dashboard"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <BlueHighlightListItem button selected={location.pathname === "/"}>
              <IconWithText>
                <DashboardIcon />
                <Text>Dashboard</Text>
              </IconWithText>
            </BlueHighlightListItem>
          </NavLink>

          <BlueHighlightListItem
            button
            onClick={handleAdminMenuClick}
            selected={location.pathname.startsWith("/admin")}
          >
            <IconWithText>
              <AdminPanelSettingsIcon />
              <Text>Admin</Text>
              {adminMenuOpen ? <SubmenuExpandIcon /> : <SubmenuIcon />}
            </IconWithText>
          </BlueHighlightListItem>
          {adminMenuOpen && (
            <List component="div" disablePadding>
              <NavLink
                to="/admin/campaign"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <SubmenuItem
                  button
                  selected={location.pathname === "/admin/campaign"}
                >
                  <IconWithText>
                    <CampaignIcon />
                    <Text>Campaign</Text>
                  </IconWithText>
                </SubmenuItem>
              </NavLink>
              <NavLink
                to="/admin"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <SubmenuItem button selected={location.pathname === "/admin"}>
                  <IconWithText>
                    <PersonAddAltIcon />
                    <Text>User Control</Text>
                  </IconWithText>
                </SubmenuItem>
              </NavLink>

              <NavLink
                to="/department"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <SubmenuItem
                  button
                  selected={location.pathname === "/department"}
                >
                  <IconWithText>
                    <BusinessRounded />
                    <Text>Departments</Text>
                  </IconWithText>
                </SubmenuItem>
              </NavLink>
              {/* qualification */}
              <NavLink
                to="/qualification"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <SubmenuItem
                  button
                  selected={location.pathname === "/qualification"}
                >
                  <IconWithText>
                    <CastForEducationRounded />
                    <Text>Qualification</Text>
                  </IconWithText>
                </SubmenuItem>
              </NavLink>
              <NavLink
                to="/medicinecategory"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <SubmenuItem
                  button
                  selected={location.pathname === "/medicinecategory"}
                >
                  <IconWithText>
                    <AiFillMedicineBox size={26} />
                    <Text>Medicine Catagory</Text>
                  </IconWithText>
                </SubmenuItem>
              </NavLink>
            </List>
          )}
          <NavLink
            to="/inventory"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <BlueHighlightListItem
              button
              selected={location.pathname === "/inventory"}
            >
              <IconWithText>
                <InventoryIcon />
                <Text>Inventory</Text>
              </IconWithText>
            </BlueHighlightListItem>
          </NavLink>
          <NavLink
            to="/patients"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <BlueHighlightListItem
              button
              selected={location.pathname === "/patients"}
            >
              <IconWithText>
                <PeopleIcon />
                <Text>Patients</Text>
              </IconWithText>
            </BlueHighlightListItem>
          </NavLink>
          <NavLink
            to="/reports"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <BlueHighlightListItem
              button
              selected={location.pathname === "/reports"}
            >
              <IconWithText>
                <ReportIcon />
                <Text>Reports</Text>
              </IconWithText>
            </BlueHighlightListItem>
          </NavLink>
          
        </List>
      )}

      {/* Doctor Routes */}
      {loggedInUser.role == "doctor" && (
        <List sx={{ flexGrow: 1, marginTop: 0 }}>
          <NavLink
            to="/dashboard"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <BlueHighlightListItem
              button
              selected={location.pathname === "/dashboard"}
            >
              <IconWithText>
                <DashboardIcon />
                <Text>Doctor Dashboard</Text>
              </IconWithText>
            </BlueHighlightListItem>
          </NavLink>
          <NavLink
            to="/doctor"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <BlueHighlightListItem
              button
              selected={location.pathname === "/doctor"}
            >
              <IconWithText>
                <PeopleIcon />
                <Text>Patients</Text>
              </IconWithText>
            </BlueHighlightListItem>
          </NavLink>
        </List>
      )}

      {loggedInUser.role == "pharmacist" && (
        <List sx={{ flexGrow: 1, marginTop: 0 }}>
          <NavLink
            to="/pharmacist"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <BlueHighlightListItem
              button
              selected={location.pathname === "/pharmacist"}
            >
              <IconWithText>
                <PeopleIcon />
                <Text>Appointments</Text>
              </IconWithText>
            </BlueHighlightListItem>
          </NavLink>
        </List>
      )}
    </Drawer>
  );
}

export default Sidebar;

// old aproach just for reference
// import React, { useState } from 'react';
// import Drawer from '@mui/material/Drawer';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import ListItemText from '@mui/material/ListItemText';
// import Toolbar from '@mui/material/Toolbar';
// import { styled } from '@mui/material/styles';
// import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
// import ChevronRightIcon from '@mui/icons-material/ChevronRight';
// import { Link, useLocation } from 'react-router-dom';

// const DrawerHeader = styled('div')(({ theme }) => ({
//   display: 'flex',
//   alignItems: 'center',
//   padding: theme.spacing(0, 1),
//   // necessary for content to be below app bar
//   ...theme.mixins.toolbar,
//   justifyContent: 'flex-end',
// }));

// const BlueHighlightListItem = styled(ListItem)(({ theme }) => ({
//   '&.Mui-selected': {
//     backgroundColor: theme.palette.primary.main,
//     color: theme.palette.primary.contrastText,
//   },
// }));

// function Sidebar() {
//   const location = useLocation();
//   const [isOpen, setIsOpen] = useState(true);

//   return (
//     <Drawer
//       variant="permanent"
//       open={isOpen}
//       sx={{
//         width: 240,
//         flexShrink: 0,
//         '& .MuiDrawer-paper': {
//           width: 240,
//           boxSizing: 'border-box',
//           top: '64px',
//           height: 'calc(100% - 64px - 56px)',
//           display: 'flex',
//           flexDirection: 'column',
//           justifyContent: 'space-between',
//         },
//       }}
//     >
//       <Toolbar>
//         <DrawerHeader />
//         <List>
//           <BlueHighlightListItem
//             button
//             component={Link}
//             to="/"
//             selected={location.pathname === '/dashboard'}
//           >
//             <ListItemText primary="Dashboard" />
//           </BlueHighlightListItem>
//           <BlueHighlightListItem
//             button
//             component={Link}
//             to="/reports"
//             selected={location.pathname === '/reports'}
//           >
//             <ListItemText primary="Reports" />
//           </BlueHighlightListItem>
//           <BlueHighlightListItem
//             button
//             component={Link}
//             to="/patients"
//             selected={location.pathname === '/patients'}
//           >
//             <ListItemText primary="Patient Management" />
//           </BlueHighlightListItem>
//           <BlueHighlightListItem
//             button
//             component={Link}
//             to="/admin"
//             selected={location.pathname === '/admin'}
//           >
//             <ListItemText primary="Admin" />
//           </BlueHighlightListItem>
//         </List>
//       </Toolbar>
//     </Drawer>
//   );
// }

// export default Sidebar;
