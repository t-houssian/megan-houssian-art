import React, { useState, useEffect } from 'react';

interface FreeAddressValidatorProps {
  currentAddress: {
    name: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  onAddressChange: (address: {
    name: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }) => void;
  className?: string;
}

// Common US states for validation
const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'District of Columbia' }
];

const CANADIAN_PROVINCES = [
  { code: 'AB', name: 'Alberta' }, { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' }, { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' }, { code: 'NT', name: 'Northwest Territories' },
  { code: 'NS', name: 'Nova Scotia' }, { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' }, { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' }, { code: 'SK', name: 'Saskatchewan' }, { code: 'YT', name: 'Yukon' }
];

export default function FreeAddressValidator({ 
  currentAddress, 
  onAddressChange, 
  className = "" 
}: FreeAddressValidatorProps) {
  const [stateOptions, setStateOptions] = useState<{code: string, name: string}[]>([]);
  const [filteredStates, setFilteredStates] = useState<{code: string, name: string}[]>([]);
  const [showStateSuggestions, setShowStateSuggestions] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Update state options based on country
  useEffect(() => {
    if (currentAddress.country === 'US') {
      setStateOptions(US_STATES);
    } else if (currentAddress.country === 'CA') {
      setStateOptions(CANADIAN_PROVINCES);
    } else {
      setStateOptions([]);
    }
  }, [currentAddress.country]);

  // Validation functions
  const validatePostalCode = (postal: string, country: string): string | null => {
    if (!postal) return 'Postal code is required';
    
    if (country === 'US') {
      const usZip = /^\d{5}(-\d{4})?$/;
      if (!usZip.test(postal)) {
        return 'US zip code should be 5 digits (e.g., 12345 or 12345-6789)';
      }
    } else if (country === 'CA') {
      const caPostal = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
      if (!caPostal.test(postal)) {
        return 'Canadian postal code format: A1A 1A1';
      }
    }
    return null;
  };

  const validateRequiredField = (value: string, fieldName: string): string | null => {
    if (!value.trim()) {
      return `${fieldName} is required`;
    }
    return null;
  };

  // Handle input changes with validation
  const handleInputChange = (field: string, value: string) => {
    const newAddress = { ...currentAddress, [field]: value };
    onAddressChange(newAddress);

    // Real-time validation
    const errors = { ...validationErrors };
    
    switch (field) {
      case 'name':
        const nameError = validateRequiredField(value, 'Full name');
        if (nameError) errors.name = nameError;
        else delete errors.name;
        break;
      case 'addressLine1':
        const addressError = validateRequiredField(value, 'Address');
        if (addressError) errors.addressLine1 = addressError;
        else delete errors.addressLine1;
        break;
      case 'city':
        const cityError = validateRequiredField(value, 'City');
        if (cityError) errors.city = cityError;
        else delete errors.city;
        break;
      case 'postalCode':
        const postalError = validatePostalCode(value, currentAddress.country);
        if (postalError) errors.postalCode = postalError;
        else delete errors.postalCode;
        break;
    }
    
    setValidationErrors(errors);
  };

  // State autocomplete
  const handleStateChange = (value: string) => {
    handleInputChange('state', value);
    
    if (value && stateOptions.length > 0) {
      const filtered = stateOptions.filter(state => 
        state.name.toLowerCase().includes(value.toLowerCase()) ||
        state.code.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredStates(filtered);
      setShowStateSuggestions(filtered.length > 0 && value !== '');
    } else {
      setShowStateSuggestions(false);
    }
  };

  const selectState = (state: {code: string, name: string}) => {
    handleInputChange('state', state.code);
    setShowStateSuggestions(false);
  };

  // Auto-format postal code
  const handlePostalCodeChange = (value: string) => {
    let formatted = value.toUpperCase();
    
    // Format Canadian postal codes
    if (currentAddress.country === 'CA' && formatted.length === 6) {
      formatted = `${formatted.slice(0, 3)} ${formatted.slice(3)}`;
    }
    
    handleInputChange('postalCode', formatted);
  };

  return (
    <div className="space-y-3">
      {/* Name Field */}
      <div>
        <input
          type="text"
          placeholder="Full Name *"
          value={currentAddress.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`${className} ${validationErrors.name ? 'border-red-500' : ''}`}
        />
        {validationErrors.name && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
        )}
      </div>

      {/* Address Line 1 */}
      <div>
        <input
          type="text"
          placeholder="Street Address *"
          value={currentAddress.addressLine1}
          onChange={(e) => handleInputChange('addressLine1', e.target.value)}
          className={`${className} ${validationErrors.addressLine1 ? 'border-red-500' : ''}`}
        />
        {validationErrors.addressLine1 && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.addressLine1}</p>
        )}
      </div>

      {/* City and State Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <input
            type="text"
            placeholder="City *"
            value={currentAddress.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className={`${className} ${validationErrors.city ? 'border-red-500' : ''}`}
          />
          {validationErrors.city && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.city}</p>
          )}
        </div>

        {/* State with autocomplete */}
        <div className="relative">
          <input
            type="text"
            placeholder={currentAddress.country === 'CA' ? 'Province *' : 'State *'}
            value={currentAddress.state}
            onChange={(e) => handleStateChange(e.target.value)}
            onFocus={() => stateOptions.length > 0 && setShowStateSuggestions(true)}
            onBlur={() => setTimeout(() => setShowStateSuggestions(false), 200)}
            className={`${className} ${validationErrors.state ? 'border-red-500' : ''}`}
          />
          
          {showStateSuggestions && filteredStates.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-paper border border-tan rounded-md shadow-lg max-h-40 overflow-y-auto">
              {filteredStates.map((state) => (
                <div
                  key={state.code}
                  className="px-3 py-2 cursor-pointer hover:bg-ivory text-brown text-sm border-b border-tan last:border-b-0"
                  onClick={() => selectState(state)}
                >
                  <span className="font-medium">{state.code}</span> - {state.name}
                </div>
              ))}
            </div>
          )}
          
          {validationErrors.state && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.state}</p>
          )}
        </div>
      </div>

      {/* Postal Code and Country Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <input
            type="text"
            placeholder={currentAddress.country === 'CA' ? 'Postal Code *' : 'ZIP Code *'}
            value={currentAddress.postalCode}
            onChange={(e) => handlePostalCodeChange(e.target.value)}
            className={`${className} ${validationErrors.postalCode ? 'border-red-500' : ''}`}
          />
          {validationErrors.postalCode && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.postalCode}</p>
          )}
        </div>

        <select
          value={currentAddress.country}
          onChange={(e) => handleInputChange('country', e.target.value)}
          className={`${className} ${validationErrors.country ? 'border-red-500' : ''}`}
        >
          <option value="">Select Country *</option>
          <option value="US">🇺🇸 United States</option>
          <option value="CA">🇨🇦 Canada</option>
          <option value="GB">🇬🇧 United Kingdom</option>
          <option value="AU">🇦🇺 Australia</option>
          <option value="DE">🇩🇪 Germany</option>
          <option value="FR">🇫🇷 France</option>
          <option value="IT">🇮🇹 Italy</option>
          <option value="ES">🇪🇸 Spain</option>
          <option value="NL">🇳🇱 Netherlands</option>
          <option value="JP">🇯🇵 Japan</option>
        </select>
      </div>

      {/* Helpful Tips */}
      <div className="text-xs text-btn-brown space-y-1">
        <p>💡 <strong>Tips:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Type state name or abbreviation (e.g., &quot;CA&quot; or &quot;California&quot;)</li>
          <li>ZIP codes: 12345 or 12345-6789 format</li>
          <li>Canadian postal codes: A1A 1A1 format</li>
        </ul>
      </div>
    </div>
  );
}
