import React, { createContext, useContext, useState, ReactNode } from "react";

interface RfpData {
  eventName: string;
  preferredDate: string;
  alternativeDate: string;
  attendeeProfile: string;
  generalInformation: string;
  concessions: string[];
  avNeeds: string[];
  foodAndBeverage: string[];
  guestRooms: string[];
  programFlow: {
    time: string;
    function: string;
    attendanceSet: string;
  }[];
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
  eventName: "MPI New England — Professional Development",
  preferredDate: "February 17 – 18, 2026",
  alternativeDate: "February 24 – 25, 2026",
  attendeeProfile: "100–150 estimated attendance",
  generalInformation: "MPINE has traditionally held meetings on the third Wednesday or Thursday of the month; however, a creative proposal offering a different date or times of day will be considered and are encouraged.",
  concessions: [
    "MPINE asks for complimentary meal room.",
    "Staff rate at staff rooms.",
    "Complimentary parking (must).",
    "Wave patch fee for external AV company."
  ],
  avNeeds: [
    "Flipcharts, screens, wireless lavaliere microphones, lecterns, LCD projector, and Internet access."
  ],
  foodAndBeverage: [
    "Breakfast, lunch, and dinner.",
    "Cash bar for the dinner."
  ],
  guestRooms: [
    "20 staff single occupancy rooms.",
    "10 double occupancy rooms.",
    "20 ROH rooms."
  ],
  programFlow: [
    { time: "5:30pm – 7pm", function: "Registration", attendanceSet: "Two 8' tables with 4 chairs" },
    { time: "6:00pm – 7:00pm", function: "Educational Program", attendanceSet: "Frequently 100–150 people at round tables or theatre style" },
    { time: "7:00pm – 8:30pm", function: "Reception and networking", attendanceSet: "A mix of high-top cocktail and tables with seating" },
    { time: "8pm – 8:30pm", function: "Reception/Property tours", attendanceSet: "TBD" },
    { time: "9:00pm", function: "Load out, Program ends", attendanceSet: "TBD" }
  ]
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