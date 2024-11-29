import React, { createContext, useState } from 'react';

// RoleContext oluşturma
export const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const [validationState, setValidationState] = useState({});

  const updateValidation = (role, step, isValid) => {
    setValidationState((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [step]: isValid,
      },
    }));
  };

  return (
    <RoleContext.Provider value={{ validationState, updateValidation }}>
      {children}
    </RoleContext.Provider>
  );
}; 