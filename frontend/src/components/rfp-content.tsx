import { useRfp } from "../context/rfp-context";

export default function RfpContent() {
  const { rfpData } = useRfp();

  return (
    <div className="p-4 md:p-6">
      {/* RFP Content */}
      <div className="w-full bg-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Request for Proposal (RFP)</h1>
        <hr className="mb-6" />
        
        <div className="space-y-6">
          <div className="space-y-2">
            <p><strong>Event Name:</strong> {rfpData.eventName}</p>
            <p><strong>Preferred Date:</strong> {rfpData.preferredDate}</p>
            <p><strong>Alternative Date:</strong> {rfpData.alternativeDate}</p>
            <p><strong>Attendee Profile:</strong> {rfpData.attendeeProfile}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">General Information</h3>
            <p>{rfpData.generalInformation}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Concessions (if possible):</h3>
            <ul className="list-disc pl-6 space-y-1">
              {rfpData.concessions.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">AV Needs:</h3>
            <ul className="list-disc pl-6 space-y-1">
              {rfpData.avNeeds.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Food & Beverage</h3>
            <ul className="list-disc pl-6 space-y-1">
              {rfpData.foodAndBeverage.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Guest Rooms</h3>
            <ul className="list-disc pl-6 space-y-1">
              {rfpData.guestRooms.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Typical Program Sample Flow:</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="px-4 py-2 text-left">Approximate Time</th>
                    <th className="px-4 py-2 text-left">Function</th>
                    <th className="px-4 py-2 text-left">Attendance/Set</th>
                  </tr>
                </thead>
                <tbody>
                  {rfpData.programFlow.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border px-4 py-2">{item.time}</td>
                      <td className="border px-4 py-2">{item.function}</td>
                      <td className="border px-4 py-2">{item.attendanceSet}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 