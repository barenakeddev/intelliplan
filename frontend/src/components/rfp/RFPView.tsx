import React, { useState } from 'react';
import { RFP } from '../../types';

interface RFPViewProps {
  rfp: RFP | null;
  onSave: (rfpText: string) => void;
  loading: boolean;
}

const RFPView: React.FC<RFPViewProps> = ({ rfp, onSave, loading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(rfp?.rfp_text || '');

  const handleEdit = () => {
    setEditedText(rfp?.rfp_text || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    onSave(editedText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedText(rfp?.rfp_text || '');
    setIsEditing(false);
  };

  if (!rfp && !loading) {
    return (
      <div className="rfp-empty-state">
        <p>No RFP generated yet. Please generate a floor plan first.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rfp-loading">
        <p>Generating RFP...</p>
      </div>
    );
  }

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
            {rfp?.rfp_text.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RFPView; 