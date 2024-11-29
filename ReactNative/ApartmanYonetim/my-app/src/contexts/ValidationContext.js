import React, { createContext, useContext, useState } from 'react';

const ValidationContext = createContext();

export const ValidationProvider = ({ children }) => {
  const [validationState, setValidationState] = useState({});

  const updateValidation = (step, isValid) => {
    setValidationState((prev) => ({ ...prev, [step]: isValid }));
  };

  return (
    <ValidationContext.Provider value={{ validationState, updateValidation }}>
      {children}
    </ValidationContext.Provider>
  );
};

export const useValidation = () => useContext(ValidationContext);
