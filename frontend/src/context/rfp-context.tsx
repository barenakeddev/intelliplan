import React, { createContext, useContext, useState, ReactNode } from "react";

interface RfpData {
  // Event Overview
  eventName: string;
  hostOrganization: string;
  organizer: string;
  eventType: string;
  eventDescription: string;
  
  // Event Dates & Flexibility
  preferredDate: string;
  alternativeDate: string;
  dateFlexibility: boolean;
  
  // Attendance
  attendeeCount: string;
  attendeeProfile: string;
  
  // Venue Requirements
  roomsRequired: string;
  seatingArrangement: string;
  accessibilityRequirements: string;
  
  // Catering Requirements
  mealPeriods: string;
  serviceStyle: string;
  dietaryNeeds: string;
  foodAndBeverage: string[];
  
  // Audio/Visual Requirements
  avEquipment: string;
  technicalRequirements: string;
  avNeeds: string[];
  
  // Budget
  budgetRange: string;
  
  // Parking/Transportation
  parkingNeeds: string;
  transportationNeeds: string;
  
  // Contact Information
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  
  // Additional Information
  generalInformation: string;
  concessions: string[];
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
  // Event Overview
  eventName: "",
  hostOrganization: "",
  organizer: "",
  eventType: "",
  eventDescription: "",
  
  // Event Dates & Flexibility
  preferredDate: "",
  alternativeDate: "",
  dateFlexibility: false,
  
  // Attendance
  attendeeCount: "",
  attendeeProfile: "",
  
  // Venue Requirements
  roomsRequired: "",
  seatingArrangement: "",
  accessibilityRequirements: "",
  
  // Catering Requirements
  mealPeriods: "",
  serviceStyle: "",
  dietaryNeeds: "",
  foodAndBeverage: [],
  
  // Audio/Visual Requirements
  avEquipment: "",
  technicalRequirements: "",
  avNeeds: [],
  
  // Budget
  budgetRange: "",
  
  // Parking/Transportation
  parkingNeeds: "",
  transportationNeeds: "",
  
  // Contact Information
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  contactAddress: "",
  
  // Additional Information
  generalInformation: "",
  concessions: [],
  guestRooms: [],
  programFlow: []
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