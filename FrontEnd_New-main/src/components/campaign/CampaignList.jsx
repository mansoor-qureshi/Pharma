import React, { useState } from "react";
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

const campaignListHeaders = [
  {
    label: "Campaign Id",
    id: "id",
  },
  {
    label: "Campaign Name",
    id: "campaignName",
  },
  {
    label: "Campaign Description",
    id: "description",
  },
  {
    label: "Template",
    id: "template",
  },
  {
    label: "Patient Count",
    id: "patientCount",
  },
  {
    label: "Areas",
    id: "areas",
  },
];

const CampaignList = ({ campaignList, isLoading, searchTerm }) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState("");

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedCampaigns = campaignList?.slice(startIndex, endIndex);

  return (
    <div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {campaignListHeaders.map((data, index) => (
                <TableCell
                  sx={{ fontWeight: "bold" }}
                  key={`${index}-campaignHeader`}
                >
                  {data.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from(new Array(rowsPerPage)).map((_, index) => (
                  <TableRow key={`${index}-skeleton-campaign`}>
                    <TableCell colSpan={campaignListHeaders?.length}>
                      <Skeleton height={20} />
                    </TableCell>
                  </TableRow>
                ))
              : paginatedCampaigns?.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      {highlightText(campaign?.id ?? "", searchTerm)}
                    </TableCell>
                    <TableCell>{campaign?.name ?? ""}</TableCell>
                    <TableCell>{campaign.description ?? ""}</TableCell>
                    <TableCell>{campaign.template ?? ""}</TableCell>
                    <TableCell> {campaign?.patient_count ?? ""}</TableCell>
                    <TableCell>{campaign.areas ?? ""}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        count={Math.ceil(campaignList?.length / rowsPerPage)}
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

export default CampaignList;
