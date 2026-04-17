import { PRODUCT_NAME_MIN, PRODUCT_NAME_MAX, PRODUCT_PRICE_MAX } from '../../../constants';

export interface ValidationResult {
  isValid: boolean;
  errors: {
    name?: string;
    price?: string;
  };
}

export function validateProductForm(name: string, price: string): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  const trimmedName = name.trim();
  if (!trimmedName) {
    errors.name = 'Product name is required';
  } else if (trimmedName.length < PRODUCT_NAME_MIN) {
    errors.name = `Name must be at least ${PRODUCT_NAME_MIN} characters`;
  } else if (trimmedName.length > PRODUCT_NAME_MAX) {
    errors.name = `Name must be ${PRODUCT_NAME_MAX} characters or fewer`;
  }

  const trimmedPrice = price.trim();
  const numericPrice = trimmedPrice.replace(/,/g, '');
  if (!trimmedPrice) {
    errors.price = 'Price is required';
  } else {
    const numPrice = parseFloat(numericPrice);
    if (isNaN(numPrice)) {
      errors.price = 'Please enter a valid number';
    } else if (numPrice <= 0) {
      errors.price = 'Price must be greater than 0';
    } else if (numPrice > PRODUCT_PRICE_MAX) {
      errors.price = `Price cannot exceed $${PRODUCT_PRICE_MAX.toLocaleString('en-US')}`;
    } else if (!/^\d+(\.\d{1,2})?$/.test(numericPrice)) {
      errors.price = 'Price can have at most 2 decimal places';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
