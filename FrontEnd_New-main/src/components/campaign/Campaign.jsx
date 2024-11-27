import React, { useEffect, useState } from "react";
import axios from "axios";
import apiConfig from "../../apiConfig";
import { Button, Grid } from "@mui/material";

import CreateCampaignForm from "./CreateCampaignForm";
import CampaignList from "./CampaignList";
import Spinner from "../../custom/Spinner";
import { basePath } from "../../constants/ApiPaths";
import { CiSearch } from "react-icons/ci";
import { SearchInput } from "../../common/searchInput";
import { useSearch } from "../../context/SearchContext";
const Campaign = () => {
  const [campaignList, setCampaignList] = useState([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { searchTerm } = useSearch();

  useEffect(() => {
    getCampaignData();
  }, []);

  const getCampaignData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${basePath}/core/campaigns`, {});
      setCampaignList(response.data);
    } catch (error) {
      console.error("error in fetching campaign list:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const filteredCapaignList = campaignList.filter((eachCampaign) => {
    if (!searchTerm) return true;

    // When there is a search term, check against patient ID and mobile number
    const campaignId = eachCampaign.id
      ? eachCampaign.id.toString().trim().toLowerCase()
      : "";
    const trimmedSearchTerm = searchTerm.trim().toLowerCase();

    // Check if either patient ID or mobile number contains the search term
    return campaignId.includes(trimmedSearchTerm);
  });
  const handleCreateUserClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const refresh = () => {
    getCampaignData();
  };

  return (
    <div className="w-full h-full p-3 border bg-[#ffffff] ">
      <div className="p-3 flex flex-col gap-10">
        <div className="flex justify-between items-center">
          <div className="relative">
            <SearchInput />
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateUserClick}
          >
            Create New Campaign
          </Button>
        </div>
        <div>
          {filteredCapaignList.length === 0 ? (
            <div className="font-bold text-[18px] flex justify-center mt-5">
              No campaign data found matching the search!
            </div>
          ) : (
            <CampaignList
              campaignList={filteredCapaignList}
              isLoading={isLoading}
              searchTerm={searchTerm}
            />
          )}
        </div>
        {open && (
          <CreateCampaignForm
            open={open}
            handleClose={handleClose}
            refresh={refresh}
          />
        )}
      </div>
    </div>
  );
};

export default Campaign;
