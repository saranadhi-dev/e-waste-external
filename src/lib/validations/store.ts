import { validateEmail } from "./auth";

export interface StoreValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateStoreInput(data: {
  storeName?: string;
  ownerName?: string;
  email?: string;
  phone?: string;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}): StoreValidationResult {
  const errors: Record<string, string> = {};

  if (!data.storeName || !data.storeName.trim()) {
    errors.storeName = "Store name is required";
  }

  if (!data.ownerName || !data.ownerName.trim()) {
    errors.ownerName = "Owner name is required";
  }

  const emailErr = validateEmail(data.email || "");
  if (emailErr) errors.email = emailErr;

  if (!data.phone || !data.phone.trim()) {
    errors.phone = "Mobile number is required";
  } else if (!/^[0-9+\s\-()]{7,15}$/.test(data.phone.trim())) {
    errors.phone = "Enter a valid mobile phone number";
  }

  if (!data.address || !data.address.trim()) {
    errors.address = "Address is required";
  }

  if (!data.city || !data.city.trim()) {
    errors.city = "City is required";
  }

  if (!data.state || !data.state.trim()) {
    errors.state = "State is required";
  }

  if (!data.pincode || !data.pincode.trim()) {
    errors.pincode = "Pincode is required";
  } else if (!/^[0-9a-zA-Z\s\-]{3,10}$/.test(data.pincode.trim())) {
    errors.pincode = "Enter a valid pincode / postal code";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
