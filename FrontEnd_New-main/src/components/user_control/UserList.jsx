import React, { useEffect, useState } from "react";

import {
  TextField,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { highlightText } from "../../common/searchInput";
import { Pagination } from "@mui/material";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";

const doctorTable = [
  { label: "User Name", value: "username" },
  { label: "Email", value: "email" },
  { label: "Mobile Number", value: "mobile_number" },
  { label: "Department", value: "department" },
  { label: "Qualification", value: "qualification" },
  { label: "Experience", value: "experience" },
  { label: "OP Fee", value: "op_fee" },
  { label: "Country", value: "country" },
  { label: "State", value: "state" },
  { label: "City", value: "city" },
];

const adminstrationTable = [
  { label: "User Name", value: "username" },
  { label: "Role", value: "role" },
  { label: "First Name", value: "first_name" },
  { label: "Last Name", value: "last_name" },
  { label: "Email", value: "email" },
  { label: "Mobile Number", value: "mobile_number" },
  { label: "DOB", value: "dob" },
  { label: "Country", value: "country" },
  { label: "State", value: "state" },
  { label: "City", value: "city" },
];

const UserList = ({ userList, isDoctorsList, isLoading, searchTerm }) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState("");

  console.log("in userlist..... control");

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const filteredUsers = userList.filter((user) => {
    return Object.values(user).some((value) =>
      value.toString().toLowerCase().includes(filter.toLowerCase())
    );
  });

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <div className="max-h-screen">
      <TableContainer
        component={Paper}
        sx={{ maxHeight: "calc(100vh - 100px)" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              {isDoctorsList
                ? doctorTable.map((row) => {
                    return (
                      <TableCell key={row.value} sx={{ fontWeight: "bold" }}>
                        {row.label}
                      </TableCell>
                    );
                  })
                : adminstrationTable.map((row) => {
                    return (
                      <TableCell key={row.value} sx={{ fontWeight: "bold" }}>
                        {row.label}
                      </TableCell>
                    );
                  })}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from(new Array(rowsPerPage)).map((_, index) => (
                <TableRow key={index}>
                  <TableCell
                    colSpan={
                      isDoctorsList
                        ? doctorTable.length
                        : adminstrationTable.length
                    }
                  >
                    <Skeleton height={20} />
                  </TableCell>
                </TableRow>
              ))
            ) : isDoctorsList ? (
              <RenderDoctorBody paginatedUsers={paginatedUsers} searchTerm={searchTerm}/>
            ) : (
              <RenderAdminstrationBody paginatedUsers={paginatedUsers}/>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        count={Math.ceil(filteredUsers.length / rowsPerPage)}
        page={page}
        onChange={handleChangePage}
        rowsPerPageOptions={[5, 10, 25]}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        style={{ marginTop: 20 }}
      />
    </div>
  );
};

export default UserList;

const RenderDoctorBody = ({ paginatedUsers, searchTerm }) => {
  return paginatedUsers.map((user) => (
    <TableRow key={user.id} className="hover:bg-blue-50 cursor-pointer">
      <TableCell>
        <Link to={`/user?id=${user.id}`} className="text-blue-500">
          {highlightText(user?.user?.username ?? "-", searchTerm)}
        </Link>
      </TableCell>
      <TableCell>{user?.user?.email ?? "-"}</TableCell>
      <TableCell>{highlightText(user?.user?.mobile_number ?? "-", searchTerm)}</TableCell>
      <TableCell>{user?.department?.name ?? "-"}</TableCell>
      <TableCell>{user?.specialization?.name ?? "-"}</TableCell>
      <TableCell>{user?.experience ?? "-"} years</TableCell>
      <TableCell>Rs {user.op_fee ?? ""}</TableCell>
      <TableCell>{user?.address?.country ?? "-"}</TableCell>
      <TableCell>{user?.address?.state ?? "-"}</TableCell>
      <TableCell>{user?.address?.city ?? "-"}</TableCell>
    </TableRow>
  ));
};

const RenderAdminstrationBody = ({ paginatedUsers }) => {
  return paginatedUsers.map((user, index) => (
    <TableRow
      key={`adminstration-${index}`}
      className="hover:bg-blue-50 cursor-pointer"
    >
      <TableCell>{user?.username ?? "-"} </TableCell>
      <TableCell>{user?.group ?? "-"}</TableCell>
      <TableCell>{user?.first_name ?? "-"}</TableCell>
      <TableCell>{user?.last_name ?? "-"}</TableCell>
      <TableCell>{user?.email ?? "-"}</TableCell>
      <TableCell>{user?.mobile_number ?? "-"}</TableCell>
      <TableCell>{user?.dob ?? ""}</TableCell>
      <TableCell>{user?.address?.country ?? "-"}</TableCell>
      <TableCell>{user?.address?.state ?? "-"}</TableCell>
      <TableCell>{user?.address?.city ?? "-"}</TableCell>
    </TableRow>
  ));
};
