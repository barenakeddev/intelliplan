import React, { useState, useEffect, useRef } from 'react';
import { RFP } from '../../types';
import Markdown from 'markdown-to-jsx';
import HorizontalDivider from '../layout/HorizontalDivider';

interface RFPViewProps {
  rfp: RFP | null;
  onSave: (rfpText: string) => void;
  loading: boolean;
}

const RFPView: React.FC<RFPViewProps> = ({ rfp, onSave, loading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(rfp?.rfp_text || getDefaultRFPTemplate());
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const previousRfpTextRef = useRef<string | null>(null);

  // Check for updates to the RFP
  useEffect(() => {
    if (rfp?.rfp_text && previousRfpTextRef.current && rfp.rfp_text !== previousRfpTextRef.current) {
      // RFP has been updated
      setShowUpdateNotification(true);
      
      // Hide notification after 5 seconds
      const timer = setTimeout(() => {
        setShowUpdateNotification(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
    
    // Store the current RFP text for future comparison
    if (rfp?.rfp_text) {
      previousRfpTextRef.current = rfp.rfp_text;
    }
  }, [rfp?.rfp_text]);

  // Update edited text when RFP changes
  useEffect(() => {
    if (!isEditing) {
      setEditedText(rfp?.rfp_text || getDefaultRFPTemplate());
    }
  }, [rfp?.rfp_text, isEditing]);

  const handleEdit = () => {
    setEditedText(rfp?.rfp_text || getDefaultRFPTemplate());
    setIsEditing(true);
  };

  const handleSave = () => {
    onSave(editedText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedText(rfp?.rfp_text || getDefaultRFPTemplate());
    setIsEditing(false);
  };

  // Function to get the default RFP template
  function getDefaultRFPTemplate() {
    return `# Request for Proposal (RFP)

## 1. Event Overview
- **Event Name:** [Insert Event Name]
- **Event Host Organization:** [Insert Host Organization]
- **Event Organizer:** (if different from Host Organization) [Insert Organizer]
- **Event Type:** [Conference, Meeting, Exhibition, etc.]
- **Event Description:**  
  *Provide a brief overview of the event objectives, target audience, and overall theme.*

## 2. Event Dates & Flexibility
- **Preferred Date:** [Insert Date]
- **Alternative Date(s):** [Insert Date(s)]
- **Dates Flexible?** (Yes/No): [Specify]

## 3. Attendance
- **Estimated Number of Attendees:** [Insert Number]

## 4. Venue Requirements
Please provide detailed information for each room or function space required. Include any accessibility features (e.g., ADA compliance, wheelchair access):

| Room/Function        | Space Required (sqft) | Seating Arrangement (e.g., Theatre, Classroom, U-Shape) | Expected Number of Attendees | Accessibility Features |
| -------------------- | --------------------- | --------------------------------------------------------- | ---------------------------- | ------------------------ |
| *Example: Main Hall* | [Insert sqft]         | [Insert arrangement]                                      | [Insert number]              | [Insert details]         |
| *Example: Breakout 1*| [Insert sqft]         | [Insert arrangement]                                      | [Insert number]              | [Insert details]         |

## 5. Catering Requirements
- **Meal Periods:** [e.g., Breakfast, Lunch, Coffee Breaks]
- **Service Style:** [e.g., Plated, Buffet, Family-Style]

## 6. Audio/Visual Requirements
- **Equipment Needed:** (e.g., Projectors, Screens, Sound System, Microphones)
- **Additional Technical Needs:** [Any other A/V or technical support requirements]

## 7. Contact Information
- **Contact Name:** [Your Name]
- **Phone:** [Your Contact Number]
- **Email:** [Your Email Address]
- **Address:** [Your Business Address]
`;
  }

  if (loading) {
    return (
      <div className="rfp-loading">
        <p>Generating RFP...</p>
      </div>
    );
  }

  const displayText = rfp?.rfp_text || getDefaultRFPTemplate();

  return (
    <div className="rfp-container">
      <div className="rfp-header">
        <h2>Request for Proposal</h2>
        <div className="rfp-actions">
          {isEditing ? (
            <>
              <button className="rfp-save-button" onClick={handleSave}>
                Save
              </button>
              <button className="rfp-cancel-button" onClick={handleCancel}>
                Cancel
              </button>
            </>
          ) : (
            <button className="rfp-edit-button" onClick={handleEdit}>
              Edit
            </button>
          )}
        </div>
      </div>
      <HorizontalDivider />
      {showUpdateNotification && (
        <div className="rfp-update-notification">
          <p>The RFP has been updated via chat. Review the changes below.</p>
        </div>
      )}
      
      <div className="rfp-content">
        {isEditing ? (
          <textarea
            className="rfp-editor"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={20}
          />
        ) : (
          <div className="rfp-text">
            <Markdown>
              {displayText}
            </Markdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default RFPView; 