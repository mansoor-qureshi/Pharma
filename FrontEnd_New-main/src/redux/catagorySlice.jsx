import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  categoryList: [],
  newCategoryName: "",
  fieldList: [],
  formData: {},
  basket: [],
  medicineCount: {},
  medicineStock: {},
 
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
  
    setNewCategoryName: (state, action) => {
      state.newCategoryName = action.payload;
    },
    setFieldList: (state, action) => {
      state.fieldList = action.payload; // Expecting field data directly
    },
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
      // state.formData = action.payload
    },
    setBasketData: (state, action) => {
      state.basket = action.payload;
    },
    setMedicineCounts: (state, action) => {
      state.medicineCount = { ...state.medicineCount, ...action.payload };
    },
    setMedicineStock: (state, action) => {
      state.medicineStock = { ...state.medicineStock, ...action.payload };
    },
    incrementCount: (state, action) => {
      const { medicineId } = action.payload;
      state.medicineCount[medicineId] =
        (state.medicineCount[medicineId] || 0) + 1;
    },
    decrementCount: (state, action) => {
      const { medicineId } = action.payload;
      const currentCount = state.medicineCount[medicineId] || 0;
      state.medicineCount[medicineId] = Math.max(0, currentCount - 1);
    },
    setCountByInput: (state, action) => {
      const { medicineId, count, stockQuantity } = action.payload;
      state.medicineCount[medicineId] = count;
      state.medicineStock[medicineId] = stockQuantity;
    },
    resetMedicineState: (state) => {
      state.medicineCount = {};
    },
  },
});

export const {
  setNewCategoryName,
  setCountByInput,
  incrementCount,
  decrementCount,
  setFieldList,
  setFormData,
  resetMedicineState,
  setMedicineStock,
  setBasketData,
  updateMedicineStock,
  setMedicineCounts,
} = categorySlice.actions;

export default categorySlice.reducer;
