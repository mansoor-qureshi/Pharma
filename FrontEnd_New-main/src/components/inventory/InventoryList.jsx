import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React, { useState } from "react";
import Skeleton from "react-loading-skeleton";
import { Link } from "react-router-dom";
import { highlightText } from "../../common/searchInput";
const catagoryTable = [
  { label: "Medicine Name", value: "medicinename" },
  { label: "product id", value: "id" },
  { label: "dosage", value: "dosage" },
  { label: "price / Tablet", value: "price" },
  { label: "expiry date", value: "expirydate" },
];
const InventoryList = ({ isAllCatagoryList, searchTerm, isLoading }) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const paginatedFieldList = isAllCatagoryList?.slice(startIndex, endIndex);

  return (
    <div className="max-h-screen">
      <>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {catagoryTable.map((row) => {
                  return (
                    <TableCell
                      key={row.value}
                      sx={{ fontWeight: "bold" }}
                      className="capitalize"
                    >
                      {row.label}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading
                ? Array.from(new Array(rowsPerPage)).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={catagoryTable?.length}>
                        <Skeleton height={20} />
                      </TableCell>
                    </TableRow>
                  ))
                : paginatedFieldList.map((eachField) => (
                    <TableRow key={eachField.id}>
                      <TableCell>
                        <Link
                          to={`/details?id=${eachField.id}`}
                          className="text-blue-500"
                        >
                          {highlightText(eachField.name, searchTerm)}
                        </Link>
                      </TableCell>
                      <TableCell>{eachField.product_id}</TableCell>

                      <TableCell>{eachField.dosage}</TableCell>
                      <TableCell>{eachField.unit_price}</TableCell>
                      <TableCell>{eachField.expiry_date}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    </div>
  );
};

export default InventoryList;
