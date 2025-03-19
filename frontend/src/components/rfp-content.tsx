import { useRfp } from "../context/rfp-context";
import { useState, useEffect } from "react";

export default function RfpContent() {
  const { rfpData } = useRfp();
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

  return (
    <div className="p-4 md:p-6">
      {/* RFP Content */}
      <div className="w-full bg-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Request for Proposal (RFP)</h1>
        <hr className="mb-6" />
        
        <div className="space-y-6">
          {/* Event Overview */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-2">Event Overview</h3>
            <p className={getHighlightClass("eventName")}><strong>Event Name:</strong> {rfpData.eventName}</p>
            <p className={getHighlightClass("hostOrganization")}><strong>Host Organization:</strong> {rfpData.hostOrganization}</p>
            <p className={getHighlightClass("organizer")}><strong>Organizer:</strong> {rfpData.organizer}</p>
            <p className={getHighlightClass("eventType")}><strong>Event Type:</strong> {rfpData.eventType}</p>
            <p className={getHighlightClass("eventDescription")}><strong>Description:</strong> {rfpData.eventDescription}</p>
          </div>

          {/* Event Dates & Flexibility */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-2">Event Dates & Flexibility</h3>
            <p className={getHighlightClass("preferredDate")}><strong>Preferred Date:</strong> {rfpData.preferredDate}</p>
            <p className={getHighlightClass("alternativeDate")}><strong>Alternative Date:</strong> {rfpData.alternativeDate}</p>
            <p className={getHighlightClass("dateFlexibility")}><strong>Flexibility:</strong> {rfpData.dateFlexibility ? "Yes" : "No"}</p>
          </div>

          {/* Attendance */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-2">Attendance</h3>
            <p className={getHighlightClass("attendeeCount")}><strong>Estimated Number of Attendees:</strong> {rfpData.attendeeCount}</p>
          </div>

          {/* Venue Requirements */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-2">Venue Requirements</h3>
            <p className={getHighlightClass("roomsRequired")}><strong>Number of Rooms/Spaces Required:</strong> {rfpData.roomsRequired}</p>
            <p className={getHighlightClass("seatingArrangement")}><strong>Seating Arrangement:</strong> {rfpData.seatingArrangement}</p>
            <p className={getHighlightClass("accessibilityRequirements")}><strong>Accessibility Requirements:</strong> {rfpData.accessibilityRequirements}</p>
          </div>

          {/* Catering Requirements */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-2">Catering Requirements</h3>
            <p className={getHighlightClass("mealPeriods")}><strong>Meal Periods:</strong> {rfpData.mealPeriods}</p>
            <p className={getHighlightClass("serviceStyle")}><strong>Service Style:</strong> {rfpData.serviceStyle}</p>
            
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
            <p className={getHighlightClass("technicalRequirements")}><strong>Technical Requirements:</strong> {rfpData.technicalRequirements}</p>
            
            <div className={getHighlightClass("avNeeds")}>
              <h4 className="text-md font-semibold mb-1">AV Needs Details:</h4>
              {rfpData.avNeeds && rfpData.avNeeds.length > 0 ? (
                <ul className="list-disc pl-6 space-y-1">
                  {rfpData.avNeeds.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          {/* Budget Range */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-2">Budget Information</h3>
            <p className={getHighlightClass("budgetRange")}><strong>Budget Range:</strong> {rfpData.budgetRange}</p>
          </div>

          {/* Parking/Transportation */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-2">Parking & Transportation</h3>
            <p className={getHighlightClass("parkingNeeds")}><strong>Parking Needs:</strong> {rfpData.parkingNeeds}</p>
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
            <p className={getHighlightClass("contactName")}><strong>Name:</strong> {rfpData.contactName}</p>
            <p className={getHighlightClass("contactPhone")}><strong>Phone:</strong> {rfpData.contactPhone}</p>
            <p className={getHighlightClass("contactEmail")}><strong>Email:</strong> {rfpData.contactEmail}</p>
            <p className={getHighlightClass("contactAddress")}><strong>Address:</strong> {rfpData.contactAddress}</p>
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
          <div className={getHighlightClass("guestRooms")}>
            <h3 className="text-lg font-semibold mb-2">Guest Rooms</h3>
            {rfpData.guestRooms && rfpData.guestRooms.length > 0 ? (
              <ul className="list-disc pl-6 space-y-1">
                {rfpData.guestRooms.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : null}
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