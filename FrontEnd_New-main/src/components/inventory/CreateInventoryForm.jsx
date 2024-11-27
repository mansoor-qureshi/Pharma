import React, { useEffect, useState } from "react";
import Spinner from "../../custom/Spinner";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
} from "@mui/material";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { basePath } from "../../constants/ApiPaths";
import { toast } from "react-toastify";
import { getAccessToken } from "../../common/businesslogic";

const CreateInventoryForm = (props) => {
  const { open, handleClose, refresh, medicineInfo = null } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [categoryList, setCategoryList] = useState([]);
  const [formData, setFormData] = useState({
    category: "",
    product_id: "",
    name: "",
    drug: "",
    dosage: "",
    unit_price: "",
    expiry_date: "",
    side_effects: "",
    quantity: "",
    reorder_level: Number,
  });

  const dispatch = useDispatch();

  useEffect(() => {
    if (medicineInfo) {
      handleData();
    }
    return () => {
      clearFormData();
    };
  }, []);
  const handleData = () => {
    const data = {
      category: medicineInfo?.category.name,
      product_id: medicineInfo?.product_id,
      name: medicineInfo?.name,
      drug: medicineInfo?.drug,
      dosage: medicineInfo?.dosage,
      unit_price: medicineInfo?.unit_price,
      expiry_date: medicineInfo?.expiry_date,
      side_effects: medicineInfo?.side_effects,
      quantity: medicineInfo?.stock?.quantity,
      reorder_level: medicineInfo?.stock?.reorder_level,
    };
    setFormData(data);
  };
  const clearFormData = () => {
    setFormData({
      category: "",
      product_id: "",
      name: "",
      drug: "",
      dosage: "",
      unit_price: "",
      expiry_date: "",
      side_effects: "",
      quantity: "",
      reorder_level: "",
    });
    setFormErrors({});
  };
  useEffect(() => {
    fetchCategoryList();
  }, []);

  const fetchCategoryList = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${basePath}/inventory/category`);
      setCategoryList(response.data);
    } catch (error) {
      console.error("Error fetching categoryList:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleChange = (event) => {
    const { name, value } = event.target;

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }

    let updatedValue = value;
    let errorMessage = "";

    if (name === "product_id" || name === "name") {
      if (/[^a-zA-Z0-9]/.test(value)) {
        errorMessage = `${
          name === "product_id" ? "Product ID" : "Name"
        } should contain only letters and numbers.`;
        updatedValue = value.replace(/[^a-zA-Z0-9]/g, "");
      } else if (categoryList.some((item) => item.product_id === value)) {
        errorMessage = "This Product ID already exists.";
      }
    } else if (name === "unit_price" || name === "quantity") {
      if (/[^0-9]/.test(value)) {
        errorMessage = `${
          name === "unit_price" ? "Price" : "Quantity"
        } should contain only numbers.`;
        updatedValue = value.replace(/[^0-9]/g, "");
      }
    }

    if (errorMessage) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: errorMessage,
      }));
    } else {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: updatedValue,
    }));
  };

  const validateCreateFieldForm = () => {
    const errors = {};
    let requiredFields = [
      "category",
      "product_id",
      "name",
      "unit_price",
      "expiry_date",
      "quantity",
    ];

    requiredFields.forEach((field) => {
      if (
        !formData[field] ||
        (typeof formData[field] === "string" && formData[field].trim() === "")
      ) {
        errors[field] = "This field is required";
      }
    });
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateCreateFieldForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const selectedCategory = categoryList.find(
      (category) => category.name === formData.category
    );

    const existingProduct = selectedCategory?.products?.find(
      (product) =>
        product.product_id === formData.product_id &&
        product.name === formData.name
    );

    if (existingProduct) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        product_id:
          "A medicine with this product ID already exists in this category.",
        name: "A medicine with this product name already exists in this category.",
      }));

      return;
    }

    const finalData = {
      ...formData,
      side_effects: formData.side_effects || null, // Ensure consistency
      stock: {
        quantity: formData.quantity,
        reorder_level: formData.reorder_level || Number,
      },
    };

    const accessToken = getAccessToken();

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${basePath}/inventory/medicines/create/`,
        finalData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        toast.success("Inventory item created successfully");
        // refresh(); // Update inventory list
        handleClose(); // Close the modal
      } else {
        throw new Error("Unexpected response from the server");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.product_id?.[0] ||
        error.response?.data?.name ||
        e;
      ("Failed to crate medicie. Please try again.");

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const validateFormForUpdate = () => {
    const errors = {};
    let requiredFields = [
      "category",
      "product_id",
      "name",
      "unit_price",
      "expiry_date",
      "quantity",
    ];
    requiredFields.forEach((field) => {
      if (formData[field] === "") {
        errors[field] = "This field is required";
      }
    });
    return errors;
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    const errors = validateFormForUpdate();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    const finalData = {
      ...formData,
      side_effects: formData.side_effects || null, // Ensure consistency
      stock: {
        quantity: formData.quantity,
        reorder_level: formData.reorder_level || Number,
      },
    };
    const accessToken = getAccessToken();
    try {
      setIsLoading(true);
      const response = await axios.put(
        `${basePath}/inventory/medicine/${medicineInfo.id}/`,
        finalData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(response.data);
      toast.success("Medicine Info updated successfully");
      refresh();
      handleClose();
    } catch (error) {
      const errorMessage =
        error.response?.data?.product_id?.[0] ||
        error.response?.data?.name ||
        e;
      ("Failed to crate medicie. Please try again.");

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isLoading && <Spinner />}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <div className="flex justify-between items-center">
            <span>Create New Field</span>
            <IoMdClose onClick={handleClose} className="cursor-pointer" />
          </div>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} className="py-5">
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Category"
                  fullWidth
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  error={!!formErrors.category}
                  helperText={formErrors.category}
                  required
                >
                  {categoryList.map((eachCategory) => (
                    <MenuItem key={eachCategory.id} value={eachCategory.name}>
                      {eachCategory.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Product Id"
                  fullWidth
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleChange}
                  error={!!formErrors.product_id}
                  helperText={formErrors.product_id}
                  disabled={medicineInfo}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Name"
                  fullWidth
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  disabled={medicineInfo}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Drug"
                  fullWidth
                  name="drug"
                  value={formData.drug}
                  onChange={handleChange}
                  error={!!formErrors.drug}
                  helperText={formErrors.drug}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Dosage"
                  fullWidth
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleChange}
                  error={!!formErrors.dosage}
                  helperText={formErrors.dosage}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Price / Tablet"
                  fullWidth
                  name="unit_price"
                  value={formData.unit_price}
                  onChange={handleChange}
                  error={!!formErrors.unit_price}
                  helperText={formErrors.unit_price}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Expiry Date"
                  fullWidth
                  name="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  error={!!formErrors.expiry_date}
                  helperText={formErrors.expiry_date}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Side Effects"
                  fullWidth
                  name="side_effects"
                  value={formData.side_effects}
                  onChange={handleChange}
                  error={!!formErrors.side_effects}
                  helperText={formErrors.side_effects}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Quantity"
                  fullWidth
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  error={!!formErrors.quantity}
                  helperText={formErrors.quantity}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Reorder Level"
                  fullWidth
                  name="reorder_level"
                  value={formData.reorder_level}
                  onChange={handleChange}
                  error={!!formErrors.reorder_level}
                  helperText={formErrors.reorder_level}
                />
              </Grid>
            </Grid>
            <DialogActions className="justify-end">
              <Button onClick={handleClose} color="secondary">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={!medicineInfo ? handleSubmit : handleUpdate}
              >
                {!medicineInfo ? "Create" : "Update"}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateInventoryForm;
