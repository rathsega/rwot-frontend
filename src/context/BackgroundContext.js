import React, { createContext, useContext, useState } from "react";

const BackgroundContext = createContext();

export const BackgroundProvider = ({ children }) => {
  const [bgMode, setBgMode] = useState("light"); // default is light background

  return (
    <BackgroundContext.Provider value={{ bgMode, setBgMode }}>
      {children}
    </BackgroundContext.Provider>
  );
};

export const useBackground = () => useContext(BackgroundContext);
