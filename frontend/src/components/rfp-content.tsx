import { useRfp } from "../context/rfp-context";
import { useState, useEffect } from "react";

// Define a component for the confidence indicator
const ConfidenceIndicator = ({ confidence = 0 }: { confidence?: number }) => {
  // Default to gray if confidence is not provided
  if (confidence === undefined) return null;
  
  // Convert to percentage for display
  const percentage = Math.round(confidence * 100);
  
  // Determine color based on confidence level
  let color = "bg-gray-300"; // Default
  if (confidence >= 0.8) {
    color = "bg-green-500";
  } else if (confidence >= 0.6) {
    color = "bg-yellow-500";
  } else if (confidence >= 0.4) {
    color = "bg-orange-400";
  } else {
    color = "bg-red-500";
  }
  
  return (
    <div className="inline-flex items-center ml-2 group" title={`Confidence: ${percentage}%`}>
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
      <span className="opacity-0 group-hover:opacity-100 absolute bg-gray-800 text-white text-xs px-2 py-1 rounded -mt-8 ml-2 transition-opacity">
        {percentage}% confidence
      </span>
    </div>
  );
};

export default function RfpContent() {
  const { rfpData, dataConfidence } = useRfp();
  const [highlightedFields, setHighlightedFields] = useState<Record<string, boolean>>({});
  const [previousRfpData, setPreviousRfpData] = useState(rfpData);

  // Check for updates in rfpData and highlight changed fields
  useEffect(() => {
    const changedFields: Record<string, boolean> = {};
    
    // Check for primitive field changes
    for (const key in rfpData) {
      if (typeof rfpData[key as keyof typeof rfpData] !== 'object' && 
          rfpData[key as keyof typeof rfpData] !== previousRfpData[key as keyof typeof previousRfpData]) {
        changedFields[key] = true;
      }
    }
    
    // Check for array field changes
    for (const key in rfpData) {
      if (Array.isArray(rfpData[key as keyof typeof rfpData])) {
        if (JSON.stringify(rfpData[key as keyof typeof rfpData]) !== 
            JSON.stringify(previousRfpData[key as keyof typeof previousRfpData])) {
          changedFields[key] = true;
        }
      }
    }
    
    // Only set new highlights if we have changes
    if (Object.keys(changedFields).length > 0) {
      setHighlightedFields(changedFields);
      
      // Clear highlights after animation completes
      const timer = setTimeout(() => {
        setHighlightedFields({});
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    // Update previous data for next comparison
    setPreviousRfpData(rfpData);
  }, [rfpData, previousRfpData]);

  const getHighlightClass = (fieldName: string) => {
    return highlightedFields[fieldName] 
      ? "highlight-field" 
      : "";
  };

  // Format text for proper capitalization and sentence structure
  const formatText = (text: any): string => {
    // Handle non-string values
    if (text === null || text === undefined) return '';
    
    // Convert to string if it's not already
    const textStr = typeof text === 'string' ? text : String(text);
    
    // Return empty string for empty text
    if (textStr.length === 0) return '';
    
    // If the text is already capitalized or formatted properly, return as is
    if (textStr[0] === textStr[0].toUpperCase()) {
      return textStr;
    }
    
    // Capitalize first letter and ensure it ends with proper punctuation
    let formattedText = textStr.charAt(0).toUpperCase() + textStr.slice(1);
    
    // Add a period if it's a sentence and doesn't end with punctuation
    if (formattedText.length > 10 && 
        !formattedText.endsWith('.') && 
        !formattedText.endsWith('!') && 
        !formattedText.endsWith('?')) {
      formattedText += '.';
    }
    
    return formattedText;
  };

  return (
    <div className="pb-2">
      {/* RFP Content */}
      <div className="w-full bg-white rounded-lg">
        <h1 className="text-2xl font-bold mb-6">Request for Proposal</h1>
        <hr className="mb-6" />
        
        <div className="space-y-6">
          {/* Event Overview */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-2">Event Overview</h3>
            <p className={getHighlightClass("eventName")}>
              <strong>Event Name:</strong> {formatText(rfpData.eventName)}
              <ConfidenceIndicator confidence={dataConfidence?.eventName} />
            </p>
            <p className={getHighlightClass("hostOrganization")}>
              <strong>Host Organization:</strong> {formatText(rfpData.hostOrganization)}
              <ConfidenceIndicator confidence={dataConfidence?.hostOrganization} />
            </p>
            <p className={getHighlightClass("organizer")}>
              <strong>Organizer:</strong> {formatText(rfpData.organizer)}
              <ConfidenceIndicator confidence={dataConfidence?.organizer} />
            </p>
            <p className={getHighlightClass("eventType")}>
              <strong>Event Type:</strong> {formatText(rfpData.eventType)}
              <ConfidenceIndicator confidence={dataConfidence?.eventType} />
            </p>
            <p className={getHighlightClass("eventDescription")}>
              <strong>Description:</strong> {formatText(rfpData.eventDescription)}
              <ConfidenceIndicator confidence={dataConfidence?.eventDescription} />
            </p>
          </div>

          {/* Event Dates & Flexibility */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-2">Event Dates & Flexibility</h3>
            <p className={getHighlightClass("preferredDate")}>
              <strong>Preferred Date:</strong> {rfpData.preferredDate}
              <ConfidenceIndicator confidence={dataConfidence?.preferredDate} />
            </p>
            <p className={getHighlightClass("alternativeDate")}>
              <strong>Alternative Date:</strong> {rfpData.alternativeDate}
              <ConfidenceIndicator confidence={dataConfidence?.alternativeDate} />
            </p>
            <p className={getHighlightClass("dateFlexibility")}>
              <strong>Flexibility:</strong> {rfpData.dateFlexibility ? "Yes" : "No"}
              <ConfidenceIndicator confidence={dataConfidence?.dateFlexibility} />
            </p>
          </div>

          {/* Attendance */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-2">Attendance</h3>
            <p className={getHighlightClass("attendeeCount")}>
              <strong>Estimated Number of Attendees:</strong> {rfpData.attendeeCount}
              <ConfidenceIndicator confidence={dataConfidence?.attendeeCount} />
            </p>
          </div>

          {/* Venue Requirements */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-2">Venue Requirements</h3>
            <p className={getHighlightClass("roomsRequired")}>
              <strong>Number of Rooms/Spaces Required:</strong> {rfpData.roomsRequired}
              <ConfidenceIndicator confidence={dataConfidence?.roomsRequired} />
            </p>
            <p className={getHighlightClass("seatingArrangement")}>
              <strong>Seating Arrangement:</strong> {formatText(rfpData.seatingArrangement)}
              <ConfidenceIndicator confidence={dataConfidence?.seatingArrangement} />
            </p>
            <p className={getHighlightClass("accessibilityRequirements")}>
              <strong>Accessibility Requirements:</strong> {formatText(rfpData.accessibilityRequirements)}
              <ConfidenceIndicator confidence={dataConfidence?.accessibilityRequirements} />
            </p>
          </div>

          {/* Catering Requirements */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-2">Catering Requirements</h3>
            <p className={getHighlightClass("mealPeriods")}>
              <strong>Meal Periods:</strong> {formatText(rfpData.mealPeriods)}
              <ConfidenceIndicator confidence={dataConfidence?.mealPeriods} />
            </p>
            <p className={getHighlightClass("serviceStyle")}>
              <strong>Service Style:</strong> {formatText(rfpData.serviceStyle)}
              <ConfidenceIndicator confidence={dataConfidence?.serviceStyle} />
            </p>
            <p className={getHighlightClass("dietaryNeeds")}>
              <strong>Dietary Needs:</strong> {formatText(rfpData.dietaryNeeds)}
              <ConfidenceIndicator confidence={dataConfidence?.dietaryNeeds} />
            </p>
            
            <div className={getHighlightClass("foodAndBeverage")}>
              <h4 className="text-md font-semibold mb-1">Food & Beverage Details:</h4>
              {rfpData.foodAndBeverage && rfpData.foodAndBeverage.length > 0 ? (
                <ul className="list-disc pl-6 space-y-1">
                  {rfpData.foodAndBeverage.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          {/* Audio/Visual Requirements */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-2">Audio/Visual Requirements</h3>
            <p className={getHighlightClass("avEquipment")}>
              <strong>Equipment Needed:</strong> {formatText(rfpData.avEquipment)}
              <ConfidenceIndicator confidence={dataConfidence?.avEquipment} />
            </p>
            <p className={getHighlightClass("technicalRequirements")}>
              <strong>Technical Requirements:</strong> {formatText(rfpData.technicalRequirements)}
              <ConfidenceIndicator confidence={dataConfidence?.technicalRequirements} />
            </p>
            
            <div className={getHighlightClass("avNeeds")}>
              <h4 className="text-md font-semibold mb-1">AV Needs Details:</h4>
              {rfpData.avNeeds && Array.isArray(rfpData.avNeeds) && rfpData.avNeeds.length > 0 ? (
                <ul className="list-disc pl-6 space-y-1">
                  {rfpData.avNeeds.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                rfpData.avNeeds && !Array.isArray(rfpData.avNeeds) ? (
                  <p>{formatText(rfpData.avNeeds as string)}</p>
                ) : null
              )}
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-2">Budget</h3>
            <p className={getHighlightClass("budgetRange")}>
              <strong>Budget Range:</strong> {rfpData.budgetRange}
              <ConfidenceIndicator confidence={dataConfidence?.budgetRange} />
            </p>
          </div>

          {/* Parking/Transportation */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-2">Parking/Transportation</h3>
            <p className={getHighlightClass("parkingNeeds")}>
              <strong>Parking Needs:</strong> {formatText(rfpData.parkingNeeds)}
              <ConfidenceIndicator confidence={dataConfidence?.parkingNeeds} />
            </p>
            <p className={getHighlightClass("transportationNeeds")}>
              <strong>Transportation Needs:</strong> {formatText(rfpData.transportationNeeds)}
              <ConfidenceIndicator confidence={dataConfidence?.transportationNeeds} />
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
            <p className={getHighlightClass("contactName")}>
              <strong>Name:</strong> {formatText(rfpData.contactName)}
              <ConfidenceIndicator confidence={dataConfidence?.contactName} />
            </p>
            <p className={getHighlightClass("contactEmail")}>
              <strong>Email:</strong> {rfpData.contactEmail}
              <ConfidenceIndicator confidence={dataConfidence?.contactEmail} />
            </p>
            <p className={getHighlightClass("contactPhone")}>
              <strong>Phone:</strong> {rfpData.contactPhone}
              <ConfidenceIndicator confidence={dataConfidence?.contactPhone} />
            </p>
            <p className={getHighlightClass("contactAddress")}>
              <strong>Address:</strong> {formatText(rfpData.contactAddress)}
              <ConfidenceIndicator confidence={dataConfidence?.contactAddress} />
            </p>
          </div>

          {/* Additional Information */}
          <div className={getHighlightClass("generalInformation")}>
            <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
            {rfpData.generalInformation && <p>{rfpData.generalInformation}</p>}
          </div>

          {/* Concessions */}
          <div className={getHighlightClass("concessions")}>
            <h3 className="text-lg font-semibold mb-2">Concessions (if possible):</h3>
            {rfpData.concessions && rfpData.concessions.length > 0 ? (
              <ul className="list-disc pl-6 space-y-1">
                {rfpData.concessions.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Guest Rooms */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-2">Guest Rooms</h3>
            <p className={getHighlightClass("guestRooms")}>
              <strong>Guest Room Requirements:</strong> {
                Array.isArray(rfpData.guestRooms) 
                  ? formatText(rfpData.guestRooms.join(', ')) 
                  : formatText(String(rfpData.guestRooms || ''))
              }
              <ConfidenceIndicator confidence={dataConfidence?.guestRooms} />
            </p>
          </div>

          {/* Program Flow */}
          <div className={getHighlightClass("programFlow")}>
            <h3 className="text-lg font-semibold mb-2">Typical Program Sample Flow:</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse table-fixed">
                <colgroup>
                  <col className="w-1/4" />
                  <col className="w-2/5" />
                  <col className="w-1/3" />
                </colgroup>
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="px-4 py-2 text-left border">Time</th>
                    <th className="px-4 py-2 text-left border">Function</th>
                    <th className="px-4 py-2 text-left border">Attendance/Set</th>
                  </tr>
                </thead>
                <tbody>
                  {rfpData.programFlow && rfpData.programFlow.length > 0 ? (
                    rfpData.programFlow.map((item: any, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="border px-4 py-2">{item.time}</td>
                        <td className="border px-4 py-2">{item.function}</td>
                        <td className="border px-4 py-2">{item.attendanceSet}</td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr className="bg-white">
                        <td className="border px-4 py-2 h-10"></td>
                        <td className="border px-4 py-2 h-10"></td>
                        <td className="border px-4 py-2 h-10"></td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border px-4 py-2 h-10"></td>
                        <td className="border px-4 py-2 h-10"></td>
                        <td className="border px-4 py-2 h-10"></td>
                      </tr>
                      <tr className="bg-white">
                        <td className="border px-4 py-2 h-10"></td>
                        <td className="border px-4 py-2 h-10"></td>
                        <td className="border px-4 py-2 h-10"></td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 