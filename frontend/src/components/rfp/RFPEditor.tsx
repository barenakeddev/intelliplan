import React, { useState, useEffect } from 'react';
import Markdown from 'markdown-to-jsx';
import { RFP, ParsedEventData, RFPSection } from '../../types';

interface RFPEditorProps {
  rfp: RFP | null;
  eventData: ParsedEventData | null;
  onSave: (rfpText: string) => void;
  onAIPrompt: (prompt: string) => Promise<string>;
  loading: boolean;
}

const RFPEditor: React.FC<RFPEditorProps> = ({ 
  rfp, 
  eventData, 
  onSave, 
  onAIPrompt, 
  loading 
}) => {
  const [editedText, setEditedText] = useState(rfp?.rfp_text || '');
  const [sections, setSections] = useState<RFPSection[]>([]);
  const [prompt, setPrompt] = useState('');
  const [promptLoading, setPromptLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (rfp) {
      setEditedText(rfp.rfp_text);
      parseSectionsFromRFP(rfp.rfp_text);
    }
  }, [rfp]);

  const parseSectionsFromRFP = (rfpText: string) => {
    // Simple parsing logic - assumes sections start with ## or # 
    const lines = rfpText.split('\n');
    const parsedSections: RFPSection[] = [];
    
    // Explicitly type currentSection to match RFPSection
    let currentSection: {
      id: string;
      title: string;
      content: string;
    } | null = null;
    
    let currentContent: string[] = [];

    lines.forEach((line, index) => {
      // Check if line is a section header (starts with ## or #)
      if (line.startsWith('## ') || (line.startsWith('# ') && index > 0)) {
        // If we were building a section, save it
        if (currentSection) {
          // @ts-ignore: TypeScript doesn't recognize the structure correctly
          currentSection.content = currentContent.join('\n');
          // @ts-ignore: TypeScript doesn't recognize the structure correctly
          parsedSections.push(currentSection);
          currentContent = [];
        }
        
        // Start a new section
        const title = line.replace(/^#+ /, '');
        currentSection = {
          id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          title,
          content: ''
        };
      } else if (line.startsWith('# ') && index === 0) {
        // This is the title, create a special section for it
        currentSection = {
          id: 'title',
          title: 'Title',
          content: line
        };
      } else if (currentSection) {
        // Add line to current section
        currentContent.push(line);
      }
    });

    // Add the last section
    if (currentSection) {
      // @ts-ignore: TypeScript doesn't recognize the structure correctly
      currentSection.content = currentContent.join('\n');
      // @ts-ignore: TypeScript doesn't recognize the structure correctly
      parsedSections.push(currentSection);
    }

    // If no sections were found, create a default one
    if (parsedSections.length === 0) {
      parsedSections.push({
        id: 'content',
        title: 'Content',
        content: rfpText
      });
    }

    setSections(parsedSections);
  };

  const handleSave = () => {
    onSave(editedText);
  };

  const handleSectionEdit = (sectionId: string, newContent: string) => {
    const updatedSections = sections.map(section => 
      section.id === sectionId ? { ...section, content: newContent } : section
    );
    
    // Rebuild the full RFP text
    const newRfpText = rebuildRfpText(updatedSections);
    setEditedText(newRfpText);
    setSections(updatedSections);
  };

  const rebuildRfpText = (updatedSections: RFPSection[]): string => {
    return updatedSections.map(section => section.content).join('\n\n');
  };

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    try {
      setPromptLoading(true);
      const response = await onAIPrompt(prompt);
      setEditedText(response);
      parseSectionsFromRFP(response);
      setPrompt('');
    } catch (error) {
      console.error('Error processing AI prompt:', error);
    } finally {
      setPromptLoading(false);
    }
  };

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  if (loading) {
    return (
      <div className="rfp-loading">
        <p>Generating RFP...</p>
      </div>
    );
  }

  if (!rfp && !eventData) {
    return (
      <div className="rfp-empty-state">
        <p>No event data available. Please create an event first.</p>
      </div>
    );
  }

  const activeContent = activeSection 
    ? sections.find(s => s.id === activeSection)?.content || ''
    : editedText;

  return (
    <div className="rfp-editor-container">
      <div className="rfp-editor-header">
        <h2>Request for Proposal Editor</h2>
        <button className="rfp-save-button" onClick={handleSave}>
          Save RFP
        </button>
      </div>

      <div className="rfp-editor-content">
        <div className="rfp-sections-nav">
          {sections.map(section => (
            <div 
              key={section.id}
              className={`rfp-section-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => handleSectionClick(section.id)}
            >
              {section.title}
            </div>
          ))}
        </div>

        <div className="rfp-main-editor">
          {activeSection ? (
            <textarea
              className="rfp-text-editor"
              value={activeContent}
              onChange={(e) => handleSectionEdit(activeSection, e.target.value)}
              rows={25}
            />
          ) : (
            <textarea
              className="rfp-text-editor"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={25}
            />
          )}
        </div>
      </div>

      <div className="rfp-ai-prompt-container">
        <h3>Modify with AI</h3>
        <form onSubmit={handlePromptSubmit} className="rfp-prompt-form">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt to modify the RFP (e.g., 'Add more details about AV requirements')"
            className="rfp-prompt-input"
            disabled={promptLoading}
          />
          <button 
            type="submit" 
            className="rfp-prompt-button"
            disabled={promptLoading}
          >
            {promptLoading ? 'Processing...' : 'Apply'}
          </button>
        </form>
      </div>

      <div className="rfp-preview">
        <h3>Preview</h3>
        <div className="rfp-preview-content">
          <Markdown>
            {editedText}
          </Markdown>
        </div>
      </div>
    </div>
  );
};

export default RFPEditor; 