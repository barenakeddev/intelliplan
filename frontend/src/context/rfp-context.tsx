import React, { createContext, useContext, useState, ReactNode } from "react";

interface RfpData {
  eventName: string;
  eventType: string;
  eventDescription: string;
  preferredDates: string;
  alternativeDates: string;
  eventDuration: string;
  attendees: number;
}

interface RfpContextType {
  rfpData: RfpData;
  setRfpData: React.Dispatch<React.SetStateAction<RfpData>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  generatedRfp: string;
  setGeneratedRfp: React.Dispatch<React.SetStateAction<string>>;
}

const initialRfpData: RfpData = {
  eventName: "[Insert Event Name]",
  eventType: "Corporate Conference",
  eventDescription: "A corporate conference for 200 attendees. The event will include presentations, workshops, networking opportunities, and catered meals.",
  preferredDates: "[Insert Preferred Dates]",
  alternativeDates: "[Insert Alternative Dates]",
  eventDuration: "[Insert Duration]",
  attendees: 200,
};

const RfpContext = createContext<RfpContextType | undefined>(undefined);

export const RfpProvider = ({ children }: { children: ReactNode }) => {
  const [rfpData, setRfpData] = useState<RfpData>(initialRfpData);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedRfp, setGeneratedRfp] = useState("");

  return (
    <RfpContext.Provider
      value={{
        rfpData,
        setRfpData,
        isLoading,
        setIsLoading,
        generatedRfp,
        setGeneratedRfp,
      }}
    >
      {children}
    </RfpContext.Provider>
  );
};

export const useRfp = () => {
  const context = useContext(RfpContext);
  if (context === undefined) {
    throw new Error("useRfp must be used within a RfpProvider");
  }
  return context;
}; 