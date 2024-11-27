import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  MenuItem,
  Alert,
  Snackbar,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import Spinner from "../../custom/Spinner";
import { IoIosArrowRoundBack } from "react-icons/io";
import { basePath } from "../../constants/ApiPaths";
import { toast } from "react-toastify";
import axios from "axios";
import { getAccessToken } from "../../common/businesslogic";
import { useDispatch, useSelector } from "react-redux";
import { resetMedicineState, setBasketData } from "../../redux/catagorySlice";
import { useNavigate } from "react-router-dom";

const BasketPage = () => {
  var basket = useSelector((store) => store.basket);
  const {
    prescription_items,
    cost_summary,
    appointment_id,
  } = basket;
  const [isResults, setIsResults] = useState(prescription_items);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("offline");
  const [discountToggle, setDiscountToggle] = useState(false);
  const [paymentOption, setPaymentOption] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [error, setError] = useState(false);
  const [discountAmount, setDiscountAmount] = useState("");
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const [isInvoiceGenerated, setIsInvoiceGenerated] = useState(false);
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const handleBack = () => {
    window.history.back();
  };

  const handleDiscountChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setDiscountAmount(value);
      setError(false);
    } else {
      <Snackbar
        open={error}
        autoHideDuration={6000}
        onClose={() => setError(false)}
        message="Please enter a valid number."
      />;
    }
  };
  useEffect(() => {
    if (paymentOption) {
      setError(false);
    }
  }, [paymentOption]);

  const handleGenerateReceipt = async (appointmentID) => {
    if (!paymentOption) {
      setError(true);
      return;
    }

    if (paymentOption !== "Cash" && !referenceId) {
      toast.error("Please provide a reference ID for this payment method.");
      return;
    }

    setError(false);

    const transformedItems = prescription_items.map((eachItem) => {
      const { id, unit_price, quantity_requested, amount_for_item } = eachItem;
      return {
        id,
        quantity_requested,
        price_per_unit: unit_price,
        total: amount_for_item,
      };
    });

    const invoiceDataToSend = {
      appointment_id,
      prescription_items: transformedItems,
      subtotal: cost_summary.subtotal || 0,
      cgst: cost_summary.CGST?.tax_amount || 0,
      sgst: cost_summary.SGST?.tax_amount || 0,
      discount: cost_summary.discount_amount || 0,
      total_amount: cost_summary.Total_amount || 0,
      transaction_number: referenceId || null,
      is_online: paymentOption !== "Cash", // Determine payment type
    };

    const accessToken = getAccessToken();

    try {
      setIsLoading(true); // Show spinner during API call
      const response = await axios.post(
        `${basePath}/inventory/payment/`,
        invoiceDataToSend,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        const successMessage =
          response.data.message || "Receipt generated successfully!";
        toast.success(successMessage);
        setIsInvoiceGenerated(true);
        dispatch(resetMedicineState())
        navigate("/pharmacist");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.message ||
        e;
      ("Failed to generate receipt. Please try again.");

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const applyDiscount = async () => {
    if (!discountToggle) return;
    if (!discountAmount) {
      alert("Discount amount cannot be empty.");
      return;
    }
    const formattedDiscount = `${discountAmount}%`;
    const dataToSend = {
      appointment_id,
      prescription_items: prescription_items,
      discount: formattedDiscount,
    };
    const accessToken = getAccessToken();
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${basePath}/inventory/process_prescription/`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response?.data) {
        dispatch(setBasketData(response?.data));
        setIsDiscountApplied(true);
        toast.success("Discount amount added successfully.");
      }
    } catch (error) {
      console.error("Error applying discountToggle:", error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const renderedItems = useMemo(() => {
    return isResults.map((item) => (
      <Box
        key={item.id}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        py={1}
        borderBottom="1px solid #ddd"
      >
        <Box flex={2}>
          <Typography variant="body1" fontWeight="bold">
            {item.name}
          </Typography>
        </Box>
        <Box flex={1} textAlign="center">
          <Typography>{item.unit_price}</Typography>
        </Box>
        <Box flex={1} textAlign="center">
          <Typography>{item.quantity_requested}</Typography>
        </Box>
        <Box flex={1} textAlign="right">
          <Typography>₹ {item.amount_for_item}</Typography>
        </Box>
      </Box>
    ));
  }, [isResults]);
  const renderSpinner = () =>
    Array.from(new Array(5)).map((_, index) => (
      <Box display="flex" alignItems="center" key={index} py={1}>
        <Spinner height={20} />
      </Box>
    ));

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      p={3}
      bgcolor="#ffffff"
      minHeight="100vh"
    >
      <IoIosArrowRoundBack
        size={32}
        style={{ cursor: "pointer", alignSelf: "start" }}
        onClick={handleBack}
      />
      <Typography variant="h4" fontWeight="bold">
        Billing
      </Typography>

      <Box mt={4} width="100%" maxWidth="950px">
        <Box flex={2} p={2}>
          {isResults.length === 0 && (
            <Typography variant="h6" textAlign="center">
              ...No Medicines added!
            </Typography>
          )}
          <Box
            display="flex"
            justifyContent="space-between"
            py={1}
            borderBottom="2px solid #ddd"
          >
            <Box flex={2}>
              <Typography variant="body1" fontWeight="bold">
                Medicine Name
              </Typography>
            </Box>
            <Box flex={1}>
              <Typography variant="body1" fontWeight="bold" textAlign="center">
                Price / Tablet
              </Typography>
            </Box>
            <Box flex={1}>
              <Typography variant="body1" fontWeight="bold" textAlign="center">
                Quantity
              </Typography>
            </Box>
            <Box flex={1}>
              <Typography variant="body1" fontWeight="bold" textAlign="right">
                Total
              </Typography>
            </Box>
          </Box>

          {/* Table Content */}
          {isLoading ? renderSpinner() : renderedItems}
        </Box>

        {/* Order Summary Section */}
        <Box flex={1} p={2} mt={5} bgcolor="#f7f7f7" borderRadius="8px">
          <Typography variant="h6" fontWeight="bold">
            Cost Summary
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="space-between">
            <Typography>Subtotal</Typography>
            <Typography>₹{cost_summary.subtotal}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography>Discount Amount</Typography>
            <Typography>₹{cost_summary.discount_amount}</Typography>
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography>CGST</Typography>
            <Box display="flex" gap={2.5}>
              <Typography>{cost_summary.CGST?.tax_percentage}</Typography>
              <Typography>₹{cost_summary.CGST?.tax_amount}</Typography>
            </Box>
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography>SGST</Typography>
            <Box display="flex" gap={2.5}>
              <Typography>{cost_summary.SGST?.tax_percentage}</Typography>
              <Typography>₹{cost_summary.SGST?.tax_amount}</Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6" fontWeight="bold">
              Total Cost
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              ₹{cost_summary.Total_amount}
            </Typography>
          </Box>

          {/* <Divider sx={{ my: 2 }} /> */}

          <Typography variant="subtitle1" fontWeight="bold">
            Payment Method
          </Typography>
          <RadioGroup
            row
            aria-label="payment-method"
            name="payment-method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            sx={{ mt: 1 }}
          >
            <FormControlLabel
              value="offline"
              control={<Radio />}
              label="Offline"
            />
            <FormControlLabel
              value="online"
              control={<Radio />}
              label="Online"
            />
          </RadioGroup>

          {/* Show additional fields if "Offline" is selected */}
          {paymentMethod === "offline" && (
            <Box mt={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={discountToggle}
                    onChange={() => setDiscountToggle(!discountToggle)}
                    disabled={isDiscountApplied}
                  />
                }
                label="Discount"
              />

              {discountToggle && (
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                  }}
                >
                  <TextField
                    label="Discount (%)"
                    value={discountAmount}
                    onChange={handleDiscountChange}
                    style={{ minWidth: "12rem" }}
                    inputProps={{
                      maxLength: 10,
                    }}
                    disabled={isDiscountApplied} // Disable input if discount is applied
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={applyDiscount}
                    disabled={isDiscountApplied} // Disable button if discount is applied
                  >
                    Apply Discount
                  </Button>
                </Box>
              )}
              <Box display="flex" gap={2} mt={2}>
                <TextField
                  label="Total Amount"
                  value={cost_summary.Total_amount}
                  disabled
                  style={{ minWidth: "18.5rem" }}
                />
                <TextField
                  label="Today Date"
                  value={new Date().toLocaleString()}
                  fullWidth
                  disabled
                />
                <TextField
                  select
                  label="Payment Method"
                  value={paymentOption}
                  placeholder=" Select Payment Method"
                  onChange={(e) => setPaymentOption(e.target.value)}
                  fullWidth
                  required
                  style={{ minWidth: "12rem" }}
                >
                  <MenuItem value="PhonePe">PhonePe</MenuItem>
                  <MenuItem value="Paytm">Paytm</MenuItem>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                </TextField>
              </Box>
              <Box display="flex" gap={2} mt={2}>
                {paymentOption && paymentOption !== "Cash" && (
                  <TextField
                    label="UTR ID / Reference ID"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                    sx={{ mt: 2 }}
                  />
                )}
              </Box>
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Please select a payment method before generating the receipt.
                </Alert>
              )}
            </Box>
          )}

          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 4, alignSelf: "flex-end" }}
            onClick={() => handleGenerateReceipt(appointment_id)}
            disabled={isInvoiceGenerated || isLoading}
          >
            {isInvoiceGenerated ? "Invoice Generated" : "Generate Receipt"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default BasketPage;
