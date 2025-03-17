import { Button } from "./ui/button";
import { ChevronLeft } from "lucide-react";
import { useRfp } from "../context/rfp-context";

export default function RfpContent() {
  const { rfpData } = useRfp();

  return (
    <div className="p-4 md:p-6">
      {/* RFP Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2 md:hidden">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-medium">Request for Proposal</h2>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">Edit</Button>
      </div>

      {/* RFP Title */}
      <h1 className="text-2xl font-bold text-center mb-6">Request for Proposal (RFP)</h1>
      <hr className="mb-8" />

      {/* RFP Content Sections */}
      <div className="space-y-8">
        {/* Section 1: Event Overview */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Section 1: Event Overview</h3>
          <div className="space-y-3">
            <div>
              <p className="font-medium">Event Name:</p>
              <p className="text-gray-600">{rfpData.eventName}</p>
            </div>
            <div>
              <p className="font-medium">Event Type:</p>
              <p className="text-gray-600">{rfpData.eventType}</p>
            </div>
            <div>
              <p className="font-medium">Event Description:</p>
              <p className="text-gray-600">
                {rfpData.eventDescription}
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Event Dates & Flexibility */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Section 2: Event Dates & Flexibility</h3>
          <div className="space-y-3">
            <div>
              <p className="font-medium">Preferred Dates:</p>
              <p className="text-gray-600">{rfpData.preferredDates}</p>
            </div>
            <div>
              <p className="font-medium">Alternative Dates:</p>
              <p className="text-gray-600">{rfpData.alternativeDates}</p>
            </div>
            <div>
              <p className="font-medium">Event Duration:</p>
              <p className="text-gray-600">{rfpData.eventDuration}</p>
            </div>
          </div>
        </section>

        {/* Section 3: Attendance */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Section 3: Attendance</h3>
          <div>
            <p className="font-medium">Estimated Number of Attendees:</p>
            <p className="text-gray-600">{rfpData.attendees}</p>
          </div>
        </section>
      </div>
    </div>
  );
} 